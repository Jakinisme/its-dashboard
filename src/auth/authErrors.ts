import { FirebaseError } from "firebase/app";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
    "auth/email-already-in-use": "This email is already registered. Please login or use a different email.",
    "auth/invalid-email": "Invalid email format.",
    "auth/user-disabled": "This account has been disabled. Please contact support.",
    "auth/user-not-found": "Invalid email or password.",
    "auth/wrong-password": "Invalid email or password.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/weak-password": "Password is too weak. Use at least 8 characters.",
    "auth/operation-not-allowed": "This login method is not allowed.",
    "auth/requires-recent-login": "Please login again to continue.",

    "auth/network-request-failed": "Network connection failed. Please check your internet connection.",
    "auth/timeout": "Request timed out. Please try again.",

    "auth/popup-closed-by-user": "Login cancelled.",
    "auth/popup-blocked": "Popup blocked by browser. Please allow popups to continue.",
    "auth/cancelled-popup-request": "Login cancelled.",
    "auth/account-exists-with-different-credential": "This email is already registered with a different login method.",

    "auth/invalid-action-code": "Verification code is invalid or has expired.",
    "auth/expired-action-code": "Verification code has expired. Please request a new one.",

    "auth/too-many-requests": "Too many attempts. Please try again later.",

    "auth/internal-error": "An internal error occurred. Please try again.",
    "auth/invalid-api-key": "Invalid application configuration.",
    "auth/app-deleted": "Application has been deleted.",
};

export function getAuthErrorMessage(error: unknown): string {
    if (error instanceof FirebaseError) {
        const customMessage = AUTH_ERROR_MESSAGES[error.code];
        if (customMessage) {
            return customMessage;
        }
        return `An error occurred: ${error.message}`;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "An unexpected error occurred. Please try again.";
}
export class AuthError extends Error {
    code?: string;
    originalError?: unknown;

    constructor(
        message: string,
        code?: string,
        originalError?: unknown
    ) {
        super(message);
        this.name = "AuthError";
        this.code = code;
        this.originalError = originalError;
    }
}
