import { ref, onValue, set, serverTimestamp, get, type Unsubscribe } from "firebase/database";
import { database } from "./index";

export interface StreamStateData {
    isLive: boolean;
    lastOfflineTimestamp: number | null;
    lastUpdated: number;
}

export const getStreamStateRef = (streamId: string) => {
    return ref(database, `streams/${streamId}`);
};

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

export const initializeStreamState = async (
    streamId: string,
    initialIsLive: boolean = false
): Promise<boolean> => {
    const streamRef = getStreamStateRef(streamId);

    try {
        const snapshot = await get(streamRef);

        if (!snapshot.exists()) {
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
