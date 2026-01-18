import { detectionEndpointService } from "../services/api/detection";
import { useEffect, useRef, useCallback } from "react";

export interface Detection {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cls: string;
  conf: number;
  plant_id?: number;
  health?: string;
  timestamp?: number;
}

interface DetectionMessage {
  bbox: [number, number, number, number];
  cls: string;
  conf_det?: number;
  conf?: number;
  health?: string;
  plant_id?: number;
}

const isValidBbox = (bbox: unknown): bbox is [number, number, number, number] => {
  return (
    Array.isArray(bbox) &&
    bbox.length === 4 &&
    bbox.every((n) => typeof n === "number" && n >= 0 && n <= 1)
  );
};

const sanitizeString = (input: unknown, maxLength: number = 50): string => {
  if (typeof input !== "string") return "unknown";
  return input
    .replace(/[<>'"]/g, "")
    .slice(0, maxLength);
};

const isValidConfidence = (conf: unknown): conf is number => {
  return typeof conf === "number" && conf >= 0 && conf <= 1;
};

const isValidPlantId = (id: unknown): id is number => {
  return typeof id === "number" && Number.isInteger(id) && id >= 0;
};

const validateDetectionMessage = (msg: unknown): msg is DetectionMessage => {
  if (!msg || typeof msg !== "object") return false;

  const m = msg as Record<string, unknown>;

  return (
    isValidBbox(m.bbox) &&
    typeof m.cls === "string" &&
    m.cls.length > 0 &&
    m.cls.length < 50
  );
};

interface UseDetectionOptions {
  maxDetections?: number;
  detectionTimeout?: number;
}

const RETRY_INTERVALS = [5000, 10000, 10000];

export const useDetection = (options: UseDetectionOptions = {}) => {
  const {
    maxDetections = 6,
    detectionTimeout = 1000
  } = options;

  const detectionsRef = useRef<Detection[]>([]);
  const healthStatusRef = useRef<Map<number, string>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const timeoutRef = useRef<number | null>(null);
  const retryDelayRef = useRef<number>(2000);
  const retryCountRef = useRef<number>(0);



  const scheduleDetectionCleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      const now = Date.now();
      const elapsed = now - lastUpdateTimeRef.current;

      if (elapsed >= detectionTimeout) {
        // console.log("[useDetection] Auto-clearing stale detections");
        detectionsRef.current = [];
      }
    }, detectionTimeout);
  }, [detectionTimeout]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeoutId: number | null = null;
    let isMounted = true;

    const connect = async () => {
      if (!isMounted) return;

      try {
        // console.log("[useDetection] Fetching detection config...");
        const config = await detectionEndpointService.getConfig();

        if (!isMounted) return;

        const { url, token } = config;
        const wsUrl = `${url}?token=${token}`;

        // Validate protocol
        try {
          const parsedUrl = new URL(url);
          if (parsedUrl.protocol !== "ws:" && parsedUrl.protocol !== "wss:") {
            throw new Error("Invalid WebSocket protocol");
          }
        } catch {
          // console.error("[useDetection] Invalid WebSocket URL from config:", err);
          if (isMounted) {
            reconnectTimeoutId = window.setTimeout(connect, 5000);
          }
          return;
        }

        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          // console.log("[useDetection] WebSocket connected");
          retryCountRef.current = 0;
          retryDelayRef.current = 2000; // Reset backoff on success
        };

        ws.onmessage = (ev) => {
          try {
            if (ev.data.length > 100000) {
              // console.error("[useDetection] Message too large, ignoringa");
              return;
            }

            const msg = JSON.parse(ev.data);
            const now = Date.now();

            if (!msg.type || typeof msg.type !== "string") {
              // console.warn("[useDetection] Invalid message type");
              return;
            }

            if (msg.type === "wide_batch") {
              lastUpdateTimeRef.current = now;

              if (!msg.detections || !Array.isArray(msg.detections)) {
                // console.log("[useDetection] No detections - clearing");
                detectionsRef.current = [];
                scheduleDetectionCleanup();
                return;
              }

              if (msg.detections.length > maxDetections * 2) {
                // console.warn("[useDetection] Too many detections, truncating");
                msg.detections = msg.detections.slice(0, maxDetections * 2);
              }

              const currentPlantIds = new Set(
                msg.detections
                  .map((d: unknown) => (d as Record<string, unknown>).plant_id)
                  .filter((id: unknown): id is number => isValidPlantId(id))
              );

              const healthKeys = Array.from(healthStatusRef.current.keys());
              for (const plantId of healthKeys) {
                if (!currentPlantIds.has(plantId)) {
                  healthStatusRef.current.delete(plantId);
                }
              }

              detectionsRef.current = msg.detections
                .filter(validateDetectionMessage)
                .slice(0, maxDetections)
                .map((d: DetectionMessage) => {
                  const plantId = isValidPlantId(d.plant_id) ? d.plant_id : 0;
                  const storedHealth = healthStatusRef.current.get(plantId);

                  return {
                    x1: Math.max(0, Math.min(1, d.bbox[0])),
                    y1: Math.max(0, Math.min(1, d.bbox[1])),
                    x2: Math.max(0, Math.min(1, d.bbox[2])),
                    y2: Math.max(0, Math.min(1, d.bbox[3])),
                    cls: sanitizeString(d.cls),
                    conf: isValidConfidence(d.conf_det || d.conf)
                      ? (d.conf_det || d.conf || 0)
                      : 0,
                    plant_id: plantId,
                    health: sanitizeString(
                      storedHealth || d.health || "unknown"
                    ),
                    timestamp: now,
                  };
                });

              scheduleDetectionCleanup();
            }

            else if (msg.type === "classify") {
              if (!isValidPlantId(msg.plant_id)) {
                // console.warn("[useDetection] Invalid plant_id in classify message");
                return;
              }

              const plantId = msg.plant_id;
              const newHealth = sanitizeString(msg.health || msg.status || "unknown");

              healthStatusRef.current.set(plantId, newHealth);

              const det = detectionsRef.current.find(d => d.plant_id === plantId);
              if (det) {
                det.health = newHealth;
                det.timestamp = now;
              }
            }
          } catch {
            // console.error("[useDetection] Message error:", err);
          }
        };

        ws.onerror = (/* err */) => {
          // console.error("[useDetection] WebSocket error:", err);
        };

        ws.onclose = () => {
          // console.log("[useDetection] WebSocket closed");
          detectionsRef.current = [];
          healthStatusRef.current.clear();
          wsRef.current = null;

          if (isMounted) {
            reconnectTimeoutId = window.setTimeout(connect, 3000);
          }
        };

      } catch {
        // console.error("[useDetection] Failed to connect:", err);

        if (isMounted) {
          const currentRetry = retryCountRef.current;
          if (currentRetry < 2) { // Max 2 retries (3 attempts total)
            const delay = RETRY_INTERVALS[currentRetry] || 10000;
            retryCountRef.current++;
            // console.log(`[useDetection] Retrying in ${delay}ms... (Preparing for Attempt ${retryCountRef.current + 1})`);
            reconnectTimeoutId = window.setTimeout(connect, delay);
          } else {
            // console.log("[useDetection] Max attempts reached");
          }
        }
      }
    };

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId);
      }
      if (ws) {
        ws.close();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [maxDetections, detectionTimeout, scheduleDetectionCleanup]);

  const clearDetections = useCallback(() => {
    detectionsRef.current = [];
    healthStatusRef.current.clear();
    lastUpdateTimeRef.current = Date.now();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    detectionsRef,
    healthStatusRef,
    clearDetections,
    retryCount: retryCountRef.current
  };
};