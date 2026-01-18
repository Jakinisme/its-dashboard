import { useRef } from "react";
import { useDetection } from "../../../hooks/useDetection";
import { useWebRTC } from "../../../hooks/useWebRTC";
import { useCanvas } from "../../../hooks/useCanvas";

import styles from "./Video.module.css";

import Loading from "../Loading/Loading";

const VideoFeed = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Detection hook - uses serverless endpoint automatically
  const { detectionsRef, clearDetections } = useDetection({
    maxDetections: 6,
    detectionTimeout: 1000,
  });

  // WebRTC WHEP connection hook
  const { status: connectionStatus, retryCount } = useWebRTC(videoRef, {
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
    <div className={styles.container}>
      {connectionStatus === "connecting" && (
        <div className={styles.overlay}>
          <Loading text={`Connecting... (Attempt ${retryCount + 1}/3)`} />
        </div>
      )}

      {connectionStatus === "failed" && (
        <div className={styles.overlay}>
          <div className={styles.errorBox}>
            <p>Connection Failed</p>
            <button
              onClick={() => window.location.reload()}
              className={styles.reloadButton}
            >
              Reload Page
            </button>
          </div>
        </div>
      )}

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