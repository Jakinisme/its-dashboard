
import { useEffect, useRef, useCallback } from "react";
import type { Detection } from "./useDetection";

interface HealthColors {
  stroke: string;
  fill: string;
}

const getHealthColor = (health?: string): HealthColors => {
  switch (health?.toLowerCase()) {
    case "healthy":
      return { stroke: "#00ff00", fill: "#00ff00" };
    case "warning":
      return { stroke: "#ffa500", fill: "#ffa500" };
    case "diseased":
      return { stroke: "#ff0000", fill: "#ff0000" };
    case "unknown":
    default:
      return { stroke: "#888888", fill: "#888888" };
  }
};

interface UseCanvasRendererOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  detectionsRef: React.RefObject<Detection[]>;
  lineWidth?: number;
  fontSize?: number;
  showHealthLabel?: boolean;
}

export const useCanvas = (options: UseCanvasRendererOptions) => {
  const {
    videoRef,
    canvasRef,
    detectionsRef,
    lineWidth = 3,
    fontSize = 14,
    showHealthLabel = true,
  } = options;

  const animationFrameRef = useRef<number | null>(null);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video || video.readyState < 2) {
      animationFrameRef.current = requestAnimationFrame(drawCanvas);
      return;
    }

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      animationFrameRef.current = requestAnimationFrame(drawCanvas);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (detectionsRef.current) {
      detectionsRef.current.forEach((det) => {
        const { x1, y1, x2, y2, cls, conf, health } = det;
        const colors = getHealthColor(health);

        ctx.strokeStyle = colors.stroke;
        ctx.lineWidth = lineWidth;
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

        const healthLabel = showHealthLabel && health ? ` - ${health.toUpperCase()}` : "";
        const txt = `${cls} ${(conf * 100).toFixed(1)}%${healthLabel}`;
        ctx.font = `${fontSize}px Arial`;
        const tw = ctx.measureText(txt).width;

        ctx.fillStyle = colors.fill;
        ctx.fillRect(x1, y1 - 20, tw + 10, 20);

        ctx.fillStyle = "white";
        ctx.fillText(txt, x1 + 5, y1 - 5);
      });
    }

    animationFrameRef.current = requestAnimationFrame(drawCanvas);
  }, [canvasRef, videoRef, detectionsRef, lineWidth, fontSize, showHealthLabel]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(drawCanvas);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [drawCanvas]);

  return {
    drawCanvas,
  };
};