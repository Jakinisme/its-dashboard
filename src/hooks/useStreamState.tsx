import { useEffect, useState, useRef } from "react";
import { formatElapsedTime, getElapsedSeconds } from "../utils/timeFormat";
import {
    subscribeToStreamState,
    initializeStreamState,
    setStreamOffline,
    setStreamLive,
    type StreamStateData,
} from "../services/Firebase/streamState";

interface StreamStateOptions {
    streamId: string;
    isLive: boolean;
    updateInterval?: number;
}

interface StreamState {
    timeAgo: string;
    elapsedSeconds: number;
    offlineTimestamp: number | null;
    isSynced: boolean;
}

export const useStreamState = ({
    streamId,
    isLive,
    updateInterval = 1000,
}: StreamStateOptions): StreamState => {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [timeAgo, setTimeAgo] = useState("Just now");
    const [offlineTimestamp, setOfflineTimestamp] = useState<number | null>(null);
    const [isSynced, setIsSynced] = useState(false);

    const isInitialized = useRef(false);
    const prevIsLive = useRef<boolean | null>(null);

    useEffect(() => {
        if (isInitialized.current) return;

        const initialize = async () => {
            try {
                await initializeStreamState(streamId, isLive);
                isInitialized.current = true;
                setIsSynced(true);
            } catch (error) {
                console.error("Failed to initialize stream state:", error);
                setIsSynced(false);
            }
        };

        initialize();
    }, [streamId, isLive]);

    useEffect(() => {
        const unsubscribe = subscribeToStreamState(
            streamId,
            (data: StreamStateData | null) => {
                if (!data) return;

                setIsSynced(true);

                if (data.isLive) {
                    setElapsedSeconds(0);
                    setTimeAgo("Just now");
                    setOfflineTimestamp(null);
                } else if (data.lastOfflineTimestamp) {
                    const elapsed = getElapsedSeconds(data.lastOfflineTimestamp);
                    setElapsedSeconds(elapsed);
                    setTimeAgo(formatElapsedTime(elapsed));
                    setOfflineTimestamp(data.lastOfflineTimestamp);
                }
            },
            (error) => {
                console.error("Firebase subscription error:", error);
                setIsSynced(false);
            }
        );

        return () => unsubscribe();
    }, [streamId]);

    useEffect(() => {
        if (prevIsLive.current === null) {
            prevIsLive.current = isLive;
            return;
        }

        if (prevIsLive.current === isLive) return;
        prevIsLive.current = isLive;

        const updateFirebase = async () => {
            try {
                if (isLive) {
                    await setStreamLive(streamId);
                } else {
                    await setStreamOffline(streamId);
                }
            } catch (error) {
                console.error("Failed to update Firebase stream state:", error);
                setIsSynced(false);
            }
        };

        updateFirebase();
    }, [isLive, streamId]);

    useEffect(() => {
        if (isLive || !offlineTimestamp) return;

        const interval = window.setInterval(() => {
            const elapsed = getElapsedSeconds(offlineTimestamp);
            setElapsedSeconds(elapsed);
            setTimeAgo(formatElapsedTime(elapsed));
        }, updateInterval);

        return () => clearInterval(interval);
    }, [isLive, offlineTimestamp, updateInterval]);

    return {
        timeAgo,
        elapsedSeconds,
        offlineTimestamp,
        isSynced,
    };
};
