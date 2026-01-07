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
    /**
     * Unique identifier for this stream (used as Firebase path)
     */
    streamId: string;

    /**
     * Whether the stream is currently live (from your LiveContext)
     */
    isLive: boolean;

    /**
     * Update interval in milliseconds (default: 1000ms)
     */
    updateInterval?: number;
}

interface StreamState {
    /**
     * Formatted time string (e.g., "5 minutes ago", "Just now")
     */
    timeAgo: string;

    /**
     * Raw elapsed seconds since stream went offline
     */
    elapsedSeconds: number;

    /**
     * Timestamp when stream went offline (null if never offline)
     */
    offlineTimestamp: number | null;

    /**
     * Whether Firebase sync is active
     */
    isSynced: boolean;
}

/**
 * Custom hook to manage stream state with Firebase RTDB
 * Syncs stream timestamps across all users and devices in real-time
 * Falls back to localStorage if Firebase fails
 */
export const useStreamState = ({
    streamId,
    isLive,
    updateInterval = 1000,
}: StreamStateOptions): StreamState => {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [timeAgo, setTimeAgo] = useState("Just now");
    const [offlineTimestamp, setOfflineTimestamp] = useState<number | null>(null);
    const [isSynced, setIsSynced] = useState(false);

    // Track if we've initialized Firebase for this stream
    const isInitialized = useRef(false);
    // Track previous isLive state to detect changes
    const prevIsLive = useRef<boolean | null>(null);

    /**
     * Initialize Firebase stream state on mount
     */
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

    /**
     * Subscribe to Firebase real-time updates
     */
    useEffect(() => {
        const unsubscribe = subscribeToStreamState(
            streamId,
            (data: StreamStateData | null) => {
                if (!data) return;

                setIsSynced(true);

                if (data.isLive) {
                    // Stream is live
                    setElapsedSeconds(0);
                    setTimeAgo("Just now");
                    setOfflineTimestamp(null);
                } else if (data.lastOfflineTimestamp) {
                    // Stream is offline - calculate elapsed time
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

    /**
     * Update Firebase when local isLive state changes
     */
    useEffect(() => {
        // Skip first render
        if (prevIsLive.current === null) {
            prevIsLive.current = isLive;
            return;
        }

        // Only update if isLive actually changed
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

    /**
     * Update elapsed time counter when offline (client-side only for smooth updates)
     */
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
