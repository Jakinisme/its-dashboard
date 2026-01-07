/**
 * Format elapsed seconds into human-readable time string
 * Similar to YouTube's "X seconds/minutes/hours/days ago" format
 */
export const formatElapsedTime = (seconds: number): string => {
    if (seconds < 1) {
        return "Just now";
    }

    if (seconds < 60) {
        return `${seconds} second${seconds === 1 ? "" : "s"} ago`;
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    }

    const hours = Math.floor(seconds / 3600);
    if (hours < 24) {
        return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    }

    const days = Math.floor(seconds / 86400);
    if (days < 7) {
        return `${days} day${days === 1 ? "" : "s"} ago`;
    }

    const weeks = Math.floor(days / 7);
    if (weeks < 4) {
        return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
    }

    const months = Math.floor(days / 30);
    return `${months} month${months === 1 ? "" : "s"} ago`;
};

/**
 * Calculate elapsed seconds from a timestamp
 */
export const getElapsedSeconds = (startTimestamp: number): number => {
    const diff = Math.floor((Date.now() - startTimestamp) / 1000);
    return diff > 0 ? diff : 0;
};
