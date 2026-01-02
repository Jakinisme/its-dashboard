import {
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  applyActionCode,
  checkActionCode,
} from "firebase/auth";
import { auth, googleProvider, githubProvider } from "../services/Firebase";
import { getAuthErrorMessage } from "./authErrors";

export async function signUpWithEmail(email: string, password: string) {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (err: unknown) {
    throw getAuthErrorMessage(err);
  }
}

export async function loginWithEmail(
  email: string,
  password: string
) {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (err: unknown) {
    throw getAuthErrorMessage(err);
  }
}

export async function loginWithGoogle() {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (err: unknown) {
    throw getAuthErrorMessage(err);
  }
}

export async function loginWithGithub() {
  try {
    return await signInWithPopup(auth, githubProvider);
  } catch (err: unknown) {
    throw getAuthErrorMessage(err);
  }
}

export function isGmail(email: string): boolean {
  const emailLower = email.toLowerCase().trim();
  return emailLower.endsWith("@gmail.com");
}

export async function sendVerificationEmail() {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user is currently signed in");
    }

    if (user.emailVerified) {
      console.log("User email is already verified");
      return;
    }

    console.log("Sending verification email to:", user.email);

    const actionCodeSettings = {
      url: window.location.origin + "/verify-email",
      handleCodeInApp: true,
    };

    await sendEmailVerification(user, actionCodeSettings);
    console.log("Verification email sent successfully");
  } catch (err: unknown) {
    console.error("Error sending verification email:", err);
    throw new Error(getAuthErrorMessage(err));
  }
}

export async function verifyEmail(actionCode: string) {
  try {
    await applyActionCode(auth, actionCode);
  } catch (err: unknown) {
    throw getAuthErrorMessage(err);
  }
}

export async function checkVerificationCode(actionCode: string) {
  try {
    return await checkActionCode(auth, actionCode);
  } catch (err: unknown) {
    throw getAuthErrorMessage(err);
  }
}
