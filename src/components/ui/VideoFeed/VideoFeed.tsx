import { useEffect, useRef } from "react";

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
  const VIDEO_DELAY = 0.12;

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:9001");
    ws.onmessage = (ev) => {
      const data: Metadata = JSON.parse(ev.data);
      metadataBuffer.current.push(data);

      if (metadataBuffer.current.length > 200) {
        metadataBuffer.current.shift();
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 1920;
    canvas.height = 1080;

    function renderLoop() {
      const video = videoRef.current!;
      if (video.readyState >= 2) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const now = performance.now() / 1000;
        const targetTS = now - VIDEO_DELAY;

        let best: Metadata | null = null;

        for (const m of metadataBuffer.current) {
          if (!best || Math.abs(m.ts - targetTS) < Math.abs(best.ts - targetTS)) {
            best = m;
          }
        }

        if (best) {
          best.detections.forEach((d) => {
            ctx.strokeStyle = "lime";
            ctx.lineWidth = 3;
            ctx.strokeRect(d.x1, d.y1, d.x2 - d.x1, d.y2 - d.y1);

            ctx.fillStyle = "black";
            ctx.fillText(`${d.cls} ${(d.conf * 100).toFixed(1)}%`, d.x1, d.y1 - 5);
          });
        }
      }

      requestAnimationFrame(renderLoop);
    }

    renderLoop();
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "auto" }}>
      <video
  ref={videoRef}
  src="http://localhost:8083/stream/53edf81f-1979-4532-94b3-010c6fceb845/channel/0/hls/live/index.m3u8"
  autoPlay
  muted
  playsInline
  style={{ width: "100%" }}
/>
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          pointerEvents: "none"
        }}
      />
    </div>
  );
}

export default VideoFeed;