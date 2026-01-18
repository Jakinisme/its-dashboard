import { useEffect, useRef, useState } from "react";
import { useLive } from "./useLive";
import { webrtcService } from "../services/api/webrtc";

interface UseWebRTCOptions {
  streamName?: string;
  reconnectDelay?: number;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

const RETRY_INTERVALS = [5000, 10000, 10000];

export const useWebRTC = (
  videoRef: React.RefObject<HTMLVideoElement | null>,
  options: UseWebRTCOptions = {}
) => {
  const { setIsLive } = useLive();

  const {
    streamName = "camera",
    reconnectDelay = 3000,
    onConnected,
    onDisconnected,
  } = options;

  const [status, setStatus] = useState<'connecting' | 'connected' | 'failed'>('connecting');
  const [retryCount, setRetryCount] = useState(0);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const configRef = useRef<{ streamUrl: string; token: string } | null>(null);

  const onConnectedRef = useRef(onConnected);
  const onDisconnectedRef = useRef(onDisconnected);
  const retryCountRef = useRef(0);

  useEffect(() => {
    onConnectedRef.current = onConnected;
    onDisconnectedRef.current = onDisconnected;
  }, [onConnected, onDisconnected]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let pc: RTCPeerConnection | null = null;
    let stopped = false;
    let retryTimeoutId: number | null = null;

    const cleanupPC = () => {
      if (pc) {
        try {
          pc.ontrack = null;
          pc.oniceconnectionstatechange = null;
          pc.close();
        } catch (err) {
          console.error("[useWebRTC] PC cleanup error:", err);
        }
        pc = null;
        pcRef.current = null;
      }
    };

    const start = async () => {
      if (retryCountRef.current > 2) {
        console.log("[useWebRTC] Max retries exceeded. Stopping.");
        setStatus('failed');
        return;
      }

      setStatus((prev) => prev === 'failed' ? 'failed' : 'connecting');

      try {
        cleanupPC();

        console.log(`[useWebRTC] Connecting... Attempt ${retryCountRef.current + 1}/3`);
        const config = await webrtcService.initialize();

        configRef.current = {
          streamUrl: config.stream.url,
          token: config.stream.token
        };

        pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        pcRef.current = pc;

        pc.ontrack = (evt) => {
          if (video.srcObject !== evt.streams[0]) {
            video.srcObject = evt.streams[0];
          }
        };

        pc.oniceconnectionstatechange = () => {
          const state = pc?.iceConnectionState;
          console.log("[useWebRTC] ICE state:", state);

          if (state === "connected") {
            console.log("[useWebRTC] ✓ WebRTC connected");
            setStatus('connected');
            retryCountRef.current = 0;
            setRetryCount(0);
            setIsLive(true);
            onConnectedRef.current?.();
          } else if (state === "disconnected" || state === "failed") {
            console.log("[useWebRTC] WebRTC disconnected/failed");

            if (!stopped) {
              setIsLive(false);
              onDisconnectedRef.current?.();
              handleRetry();
            }
          }
        };

        pc.addTransceiver("video", { direction: "recvonly" });

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        await new Promise<void>((resolve) => {
          if (pc?.iceGatheringState === "complete") return resolve();

          const handler = () => {
            if (pc?.iceGatheringState === "complete") {
              pc?.removeEventListener("icegatheringstatechange", handler);
              resolve();
            }
          };

          pc?.addEventListener("icegatheringstatechange", handler);
          setTimeout(resolve, 2000);
        });

        const whepUrl = `https://${config.stream.url}/${streamName}/whep`;
        console.log("[useWebRTC] Connecting to WHEP endpoint:", whepUrl);

        const res = await fetch(whepUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/sdp",
            "Authorization": `Bearer ${config.stream.token}`
          },
          body: pc.localDescription?.sdp,
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`WHEP failed ${res.status}: ${errorText}`);
        }

        const answerSdp = await res.text();
        await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

        console.log("[useWebRTC] ✓ WHEP negotiation complete");

      } catch (err) {
        console.error("[useWebRTC] Connection error:", err);
        cleanupPC();
        handleRetry();
      }
    };

    const handleRetry = () => {
      if (stopped) return;

      const MAX_RETRIES_ALLOWED = 2;

      if (retryCountRef.current < MAX_RETRIES_ALLOWED) {
        const delay = RETRY_INTERVALS[retryCountRef.current] || 10000;
        const nextRetryCount = retryCountRef.current + 1;

        console.log(`[useWebRTC] Retrying in ${delay}ms... (Preparing for Attempt ${nextRetryCount + 1})`);

        retryCountRef.current = nextRetryCount;
        setRetryCount(retryCountRef.current);

        if (retryTimeoutId) clearTimeout(retryTimeoutId);
        retryTimeoutId = window.setTimeout(start, delay);
      } else {
        console.log("[useWebRTC] Max attempts reached. Giving up.");
        setStatus('failed');
      }
    };

    start();

    return () => {
      stopped = true;
      cleanupPC();
      if (retryTimeoutId) clearTimeout(retryTimeoutId);
    };
  }, [videoRef, streamName, reconnectDelay, setIsLive]);

  return {
    pcRef: pcRef,
    status,
    retryCount
  };
};