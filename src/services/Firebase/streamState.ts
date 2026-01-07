import { ref, onValue, set, serverTimestamp, get, type Unsubscribe } from "firebase/database";
import { database } from "./index";

/**
 * Stream state data structure in Firebase RTDB
 */
export interface StreamStateData {
    isLive: boolean;
    lastOfflineTimestamp: number | null;
    lastUpdated: number;
}

/**
 * Get reference to a stream's state in Firebase RTDB
 */
export const getStreamStateRef = (streamId: string) => {
    return ref(database, `streams/${streamId}`);
};

/**
 * Subscribe to real-time updates for a stream's state
 * Returns unsubscribe function
 */
export const subscribeToStreamState = (
    streamId: string,
    callback: (data: StreamStateData | null) => void,
    onError?: (error: Error) => void
): Unsubscribe => {
    const streamRef = getStreamStateRef(streamId);

    return onValue(
        streamRef,
        (snapshot) => {
            const data = snapshot.val();
            callback(data);
        },
        (error) => {
            console.error(`Failed to subscribe to stream ${streamId}:`, error);
            if (onError) onError(error);
        }
    );
};

/**
 * Initialize stream state if it doesn't exist
 * Returns true if created, false if already exists
 */
export const initializeStreamState = async (
    streamId: string,
    initialIsLive: boolean = false
): Promise<boolean> => {
    const streamRef = getStreamStateRef(streamId);

    try {
        const snapshot = await get(streamRef);

        if (!snapshot.exists()) {
            // Create initial state
            await set(streamRef, {
                isLive: initialIsLive,
                lastOfflineTimestamp: initialIsLive ? null : Date.now(),
                lastUpdated: serverTimestamp(),
            });
            console.log(`Initialized stream state for ${streamId}`);
            return true;
        }

        return false;
    } catch (error) {
        console.error(`Failed to initialize stream ${streamId}:`, error);
        throw error;
    }
};

/**
 * Update stream state to offline
 */
export const setStreamOffline = async (streamId: string): Promise<void> => {
    const streamRef = getStreamStateRef(streamId);

    try {
        await set(streamRef, {
            isLive: false,
            lastOfflineTimestamp: Date.now(),
            lastUpdated: serverTimestamp(),
        });
    } catch (error) {
        console.error(`Failed to set stream ${streamId} offline:`, error);
        throw error;
    }
};

/**
 * Update stream state to live
 */
export const setStreamLive = async (streamId: string): Promise<void> => {
    const streamRef = getStreamStateRef(streamId);

    try {
        await set(streamRef, {
            isLive: true,
            lastOfflineTimestamp: null,
            lastUpdated: serverTimestamp(),
        });
    } catch (error) {
        console.error(`Failed to set stream ${streamId} live:`, error);
        throw error;
    }
};

/**
 * Update full stream state
 */
export const updateStreamState = async (
    streamId: string,
    data: Partial<StreamStateData>
): Promise<void> => {
    const streamRef = getStreamStateRef(streamId);

    try {
        const currentData = (await get(streamRef)).val() || {};
        await set(streamRef, {
            ...currentData,
            ...data,
            lastUpdated: serverTimestamp(),
        });
    } catch (error) {
        console.error(`Failed to update stream ${streamId}:`, error);
        throw error;
    }
};
