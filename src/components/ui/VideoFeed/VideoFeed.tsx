import { useRef } from "react";
import { useDetection } from "../../../hooks/useDetection";
import { useWebRTC } from "../../../hooks/useWebRTC";
import { useCanvas } from "../../../hooks/useCanvas";

import styles from "./Video.module.css";

const VideoFeed = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Detection hook - uses serverless endpoint automatically
  const { detectionsRef, clearDetections } = useDetection({
    maxDetections: 6,
    detectionTimeout: 1000,
  });

  // WebRTC WHEP connection hook
  useWebRTC(videoRef, {
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