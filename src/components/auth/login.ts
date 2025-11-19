import {
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, googleProvider, githubProvider } from "../../services/Firebase";
import { FirebaseError } from "firebase/app";

export async function signUpWithEmail(email: string, password: string) {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (err: unknown) {
    if (err instanceof FirebaseError) throw err.message;
    throw "Unexpected error";
  }
}

export async function loginWithEmail(
  email: string,
  password: string
) {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (err: unknown) {
    if (err instanceof FirebaseError) throw err.message;
    throw "Unexpected error";
  }
}

export async function loginWithGoogle() {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (err: unknown) {
    if (err instanceof FirebaseError) throw err.message;
    throw "Unexpected error";
  }
}

export async function loginWithGithub() {
  try {
    return await signInWithPopup(auth, githubProvider);
  } catch (err: unknown) {
    if (err instanceof FirebaseError) throw err.message;
    throw "Unexpected error";
  }
}
