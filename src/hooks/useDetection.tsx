// hooks/useDetection.ts
import { useEffect, useRef } from "react";

export interface Detection {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cls: string;
  conf: number;
  plant_id?: number;
  health?: string;
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
}

export const useDetection = (options: UseDetectionOptions = {}) => {
  const { 
    wsUrl = "ws://localhost:9001", 
    maxDetections = 9 
  } = options;

  const detectionsRef = useRef<Detection[]>([]);
  const healthStatusRef = useRef<Map<number, string>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[useDetection] WebSocket connected");
    };

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        
        //console.log("[useDetection] Received:", msg.type);

        if (msg.type === "wide_batch" && msg.detections) {
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
              };
            });
          
          //console.log(`[useDetection] Updated ${detectionsRef.current.length} detections`);
        }
        
        else if (msg.type === "classify" && msg.plant_id !== undefined) {
          const plantId = msg.plant_id;
          const newHealth = msg.health || msg.status || "unknown";
          
          healthStatusRef.current.set(plantId, newHealth);
          
          const det = detectionsRef.current.find(d => d.plant_id === plantId);
          if (det) {
            det.health = newHealth;
            //console.log(`[useDetection] Plant ${plantId} health: ${newHealth}`);
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
      console.log("[useDetection] WebSocket disconnected");
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [wsUrl, maxDetections]);

  const clearDetections = () => {
    detectionsRef.current = [];
    healthStatusRef.current.clear();
  };

  return {
    detectionsRef,
    healthStatusRef,
    clearDetections,
  };
};