import { useRef } from "react";
import { useDetection } from "../../../hooks/useDetection";
import { useWebRTC } from "../../../hooks/useWebRTC";
import { useCanvas } from "../../../hooks/useCanvas";

import styles from "./Video.module.css";

const VideoFeed = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Detection WebSocket hook
  const { detectionsRef, clearDetections } = useDetection({
    wsUrl: import.meta.env.VITE_FALLBACK_WS,
    maxDetections: 9,
  });

  // WebRTC WHEP connection hook
  useWebRTC(videoRef, {
    metamtxHost: import.meta.env.VITE_FALLBACK_METAMTX,
    streamName: "camera",
    reconnectDelay: 3000,
    onConnected: () => {
      clearDetections();
    },
    onDisconnected: () => {
      console.log("Video stream disconnected");
    },
  });

  // Canvas rendering hook
  useCanvas({
    videoRef,
    canvasRef,
    detectionsRef,
    lineWidth: 3,
    fontSize: 14,
    showHealthLabel: true,
  });

  return (
    <div
      className={styles.container}
    >
      <video
        ref={videoRef}
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