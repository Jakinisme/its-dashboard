// hooks/useWebRTC.ts
import { useEffect, useRef } from "react";

interface UseWebRTCOptions {
  metamtxHost?: string;
  streamName?: string;
  reconnectDelay?: number;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export const useWebRTC = (
  videoRef: React.RefObject<HTMLVideoElement | null>,
  options: UseWebRTCOptions = {}
) => {
  const {
    metamtxHost = "localhost:8889",
    streamName = "camera",
    reconnectDelay = 3000,
    onConnected,
    onDisconnected,
  } = options;

  const pcRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let pc: RTCPeerConnection | null = null;
    let stopped = false;

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
      try {
        cleanupPC();

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
            console.log("[useWebRTC] WebRTC connected");
            onConnected?.();
          } else if (state === "disconnected" || state === "failed") {
            console.log("[useWebRTC] WebRTC disconnected/failed");
            onDisconnected?.();
          }
        };

        pc.addTransceiver("video", { direction: "recvonly" });

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Wait for ICE gathering
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

        // WHEP negotiation
        const url = `http://${metamtxHost}/${streamName}/whep`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/sdp" },
          body: pc.localDescription?.sdp,
        });

        if (!res.ok) throw new Error(`WHEP failed ${res.status}`);

        const answerSdp = await res.text();
        await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

        console.log("[useWebRTC] WHEP negotiation complete");
      } catch (err) {
        console.error("[useWebRTC] Start failed:", err);
        cleanupPC();
        if (!stopped) {
          setTimeout(start, reconnectDelay);
        }
      }
    };

    start();

    return () => {
      stopped = true;
      cleanupPC();
    };
  }, [videoRef, metamtxHost, streamName, reconnectDelay, onConnected, onDisconnected]);

  return {
    pcRef,
  };
};