
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

interface UseDetectionOptions {
  wsUrl?: string;
  maxDetections?: number;
  detectionTimeout?: number;
}

export const useDetection = (options: UseDetectionOptions = {}) => {
  const { 
    wsUrl = "ws://localhost:9001", 
    maxDetections = 9,
    detectionTimeout = 1000 
  } = options;

  const detectionsRef = useRef<Detection[]>([]);
  const healthStatusRef = useRef<Map<number, string>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const timeoutRef = useRef<number | null>(null);

  const scheduleDetectionCleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      const now = Date.now();
      const elapsed = now - lastUpdateTimeRef.current;
      
      if (elapsed >= detectionTimeout) {
        console.log("[useDetection] Auto-clearing stale detections");
        detectionsRef.current = [];
      }
    }, detectionTimeout);
  }, [detectionTimeout]);

  useEffect(() => {
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[useDetection] WebSocket connected");
    };

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        const now = Date.now();
        
        if (msg.type === "wide_batch") {
          lastUpdateTimeRef.current = now;
          
          if (!msg.detections || msg.detections.length === 0) {
            console.log("[useDetection] No detections - clearing");
            detectionsRef.current = [];
            scheduleDetectionCleanup();
            return;
          }

          const currentPlantIds = new Set(
            msg.detections.map((d: DetectionMessage) => d.plant_id).filter(Boolean)
          );

          const healthKeys = Array.from(healthStatusRef.current.keys());
          for (const plantId of healthKeys) {
            if (!currentPlantIds.has(plantId)) {
              //console.log(`[useDetection] Plant ${plantId} disappeared, removing health status`);
              healthStatusRef.current.delete(plantId);
            }
          }

          detectionsRef.current = msg.detections
            .slice(0, maxDetections)
            .map((d: DetectionMessage) => {
              const plantId = d.plant_id || 0;
              const storedHealth = healthStatusRef.current.get(plantId);
              
              return {
                x1: d.bbox[0],
                y1: d.bbox[1],
                x2: d.bbox[2],
                y2: d.bbox[3],
                cls: d.cls,
                conf: d.conf_det || d.conf || 0,
                plant_id: plantId,
                health: storedHealth || d.health || "unknown",
                timestamp: now,
              };
            });
          
          //console.log(`[useDetection] Updated ${detectionsRef.current.length} detections`);
          scheduleDetectionCleanup();
        }
        
        else if (msg.type === "classify" && msg.plant_id !== undefined) {
          const plantId = msg.plant_id;
          const newHealth = msg.health || msg.status || "unknown";
          
          healthStatusRef.current.set(plantId, newHealth);
          
          const det = detectionsRef.current.find(d => d.plant_id === plantId);
          if (det) {
            det.health = newHealth;
            det.timestamp = now;
           // console.log(`[useDetection] Plant ${plantId} health updated: ${newHealth}`);
          } else {
           // console.warn(`[useDetection] Received health for unknown plant_id: ${plantId}`);
          }
        }
      } catch (err) {
        console.error("[useDetection] Message error:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("[useDetection] WebSocket error:", err);
    };

    ws.onclose = () => {
      //console.log("[useDetection] WebSocket disconnected");
      detectionsRef.current = [];
      healthStatusRef.current.clear();
    };

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      ws.close();
      wsRef.current = null;
    };
  }, [wsUrl, maxDetections, detectionTimeout, scheduleDetectionCleanup]);

  const clearDetections = () => {
    detectionsRef.current = [];
    healthStatusRef.current.clear();
    lastUpdateTimeRef.current = Date.now();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
   // console.log("[useDetection] Manual clear");
  };

  return {
    detectionsRef,
    healthStatusRef,
    clearDetections,
  };
};