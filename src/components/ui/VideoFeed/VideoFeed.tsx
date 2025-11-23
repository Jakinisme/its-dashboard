import { useEffect, useRef } from "react";
import styles from "./Video.module.css";

type Detection = {
  cls: string;
  conf: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

type Metadata = {
  ts: number;
  detections: Detection[];
};

const VideoFeed = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const metadataBuffer = useRef<Metadata[]>([]);
  const animationIdRef = useRef<number | null>(null);

  const VIDEO_DELAY = 0.15;
  const MAX_BUFFER_SIZE = 200;
  const CANVAS_WIDTH = 1920;
  const CANVAS_HEIGHT = 1080;

  useEffect(() => {
    let ws: WebSocket | null = null;

    const connectWebSocket = () => {
      try {
        ws = new WebSocket("ws://localhost:9001");

        ws.onopen = () => {
          console.log("WebSocket connected");
        };

        ws.onmessage = (ev) => {
          try {
            const data: Metadata = JSON.parse(ev.data);
            metadataBuffer.current.push(data);

            if (metadataBuffer.current.length > MAX_BUFFER_SIZE) {
              metadataBuffer.current.shift();
            }
          } catch (e) {
            console.error("Failed to parse metadata:", e);
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
        };

        ws.onclose = () => {
          console.log("WebSocket disconnected, reconnecting in 3s...");
          setTimeout(connectWebSocket, 3000);
        };
      } catch (e) {
        console.error("Failed to connect WebSocket:", e);
        setTimeout(connectWebSocket, 3000);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) ws.close();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    ctx.font = "16px Arial";

    const renderLoop = () => {
      if (video.readyState >= 2) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const now = performance.now() / 1000;
        const targetTS = now - VIDEO_DELAY;

        let best: Metadata | null = null;
        let minDiff = Infinity;

        for (const metadata of metadataBuffer.current) {
          const diff = Math.abs(metadata.ts - targetTS);
          if (diff < minDiff) {
            minDiff = diff;
            best = metadata;
          }
        }

        if (best) {
          best.detections.forEach((detection) => {
            const width = detection.x2 - detection.x1;
            const height = detection.y2 - detection.y1;

            ctx.strokeStyle = "#00ff00";
            ctx.lineWidth = 3;
            ctx.strokeRect(detection.x1, detection.y1, width, height);

            const label = `${detection.cls} ${(detection.conf * 100).toFixed(1)}%`;
            const metrics = ctx.measureText(label);
            const labelHeight = 20;
            const labelPadding = 4;

            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(
              detection.x1,
              detection.y1 - labelHeight - labelPadding,
              metrics.width + labelPadding * 2,
              labelHeight
            );

            ctx.fillStyle = "#00ff00";
            ctx.fillText(
              label,
              detection.x1 + labelPadding,
              detection.y1 - labelPadding - 4
            );
          });

          ctx.fillStyle = "#ffffff";
          ctx.font = "14px monospace";
          ctx.fillText(
            `Buffer: ${metadataBuffer.current.length} | Detections: ${best.detections.length}`,
            10,
            30
          );
        }
      }

      animationIdRef.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  return (
    <div
      className={styles.container}
    >
      <video
        ref={videoRef}
        src="http://localhost:8083/stream/53edf81f-1979-4532-94b3-010c6fceb845/channel/0/hls/live/index.m3u8"
        autoPlay
        muted
        playsInline
        className={styles.video}
      />
      <canvas
        ref={canvasRef}
        className={styles.canvas}
      />
    </div>
  );
};

export default VideoFeed;