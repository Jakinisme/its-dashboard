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
    
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    if (canvas.width !== videoWidth || canvas.height !== videoHeight) {
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      console.log(`[useCanvas] Canvas resized to ${videoWidth}x${videoHeight}`);
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      animationFrameRef.current = requestAnimationFrame(drawCanvas);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (detectionsRef.current && detectionsRef.current.length > 0) {
      detectionsRef.current.forEach((det, idx) => {
        let { x1, y1, x2, y2 } = det;
        const { cls, conf, health } = det;

        x1 = x1 * canvas.width;
        y1 = y1 * canvas.height;
        x2 = x2 * canvas.width;
        y2 = y2 * canvas.height;

        x1 = Math.max(0, Math.min(x1, canvas.width));
        y1 = Math.max(0, Math.min(y1, canvas.height));
        x2 = Math.max(0, Math.min(x2, canvas.width));
        y2 = Math.max(0, Math.min(y2, canvas.height));

        const boxWidth = x2 - x1;
        const boxHeight = y2 - y1;

        if (boxWidth <= 0 || boxHeight <= 0) {
          console.warn(`[useCanvas] Skip invalid box ${idx}: (${x1.toFixed(0)},${y1.toFixed(0)})-(${x2.toFixed(0)},${y2.toFixed(0)})`);
          return;
        }

        const colors = getHealthColor(health);

        ctx.strokeStyle = colors.stroke;
        ctx.lineWidth = lineWidth;
        ctx.strokeRect(x1, y1, boxWidth, boxHeight);

        const healthLabel = showHealthLabel && health ? ` - ${health.toUpperCase()}` : "";
        const txt = `${cls} ${(conf * 100).toFixed(1)}%${healthLabel}`;
        
        ctx.font = `bold ${fontSize}px Arial`;
        const textMetrics = ctx.measureText(txt);
        const textWidth = textMetrics.width;
        const textHeight = fontSize + 4; 

        const labelY = y1 > textHeight + 5 ? y1 - textHeight - 2 : y1 + boxHeight + 2;
        
        ctx.fillStyle = colors.fill;
        ctx.fillRect(x1, labelY, textWidth + 10, textHeight);

        ctx.fillStyle = "white";
        ctx.textBaseline = "top";
        ctx.fillText(txt, x1 + 5, labelY + 2);

        if (idx === 0) {
          console.log(`[useCanvas] Drawing detection #${idx}: cls=${cls}, ` +
            `normalized=(${det.x1.toFixed(3)},${det.y1.toFixed(3)})-(${det.x2.toFixed(3)},${det.y2.toFixed(3)}), ` +
            `pixel=(${x1.toFixed(0)},${y1.toFixed(0)})-(${x2.toFixed(0)},${y2.toFixed(0)}), ` +
            `size=${boxWidth.toFixed(0)}x${boxHeight.toFixed(0)}`);
        }
      });
    }

    animationFrameRef.current = requestAnimationFrame(drawCanvas);
  }, [canvasRef, videoRef, detectionsRef, lineWidth, fontSize, showHealthLabel]);

  useEffect(() => {
    console.log("[useCanvas] Starting render loop");
    animationFrameRef.current = requestAnimationFrame(drawCanvas);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        console.log("[useCanvas] Stopped render loop");
      }
    };
  }, [drawCanvas]);

  return {
    drawCanvas,
  };
};