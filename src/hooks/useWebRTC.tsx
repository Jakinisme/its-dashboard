import { useEffect, useRef } from "react";
import { useLive } from "./useLive";
import { webrtcService } from "../services/api/webrtc";

interface UseWebRTCOptions {
  streamName?: string;
  reconnectDelay?: number;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

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

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const configRef = useRef<{ streamUrl: string; token: string } | null>(null);

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

        // Initialize WebRTC service and get credentials
        console.log("[useWebRTC] Initializing WebRTC service...");
        const config = await webrtcService.initialize();

        // Store config for potential refresh
        configRef.current = {
          streamUrl: config.stream.url,
          token: config.stream.token
        };

        console.log("[useWebRTC] Got stream endpoint:", config.stream.url);

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
            setIsLive(true);
            onConnected?.();
          } else if (state === "disconnected" || state === "failed") {
            console.log("[useWebRTC] WebRTC disconnected/failed");
            setIsLive(false);
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

        // WHEP negotiation with authenticated endpoint
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

        console.log("[useWebRTC] WHEP negotiation complete");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        console.error("[useWebRTC] Start failed:", err);
        cleanupPC();

        // Check if config is expiring and refresh if needed
        if (configRef.current && webrtcService.isExpiring(120)) {
          console.log("[useWebRTC] Config expiring, will refresh on retry");
          configRef.current = null;
        }

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
  }, [videoRef, streamName, reconnectDelay, onConnected, onDisconnected, setIsLive]);

  return {
    pcRef,
  };
};