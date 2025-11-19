import { useState } from "react";
import { Link } from "react-router-dom";
import {
  signUpWithEmail,
  loginWithGoogle,
  loginWithGithub,
} from "../../../auth/login";

import googleIcon from "../../../assets/icons/google.svg";
import githubIcon from "../../../assets/icons/github.svg";

import Button from "../../ui/Button";
import styles from "./Register.module.css";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      await signUpWithEmail(email, password);
      //console.log("Account created!");
    } catch (msg) {
      setError(String(msg));
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await loginWithGoogle();
    } catch (msg) {
      setError(String(msg));
    }
  };

  const handleGithub = async () => {
    setError("");
    try {
      await loginWithGithub();
    } catch (msg) {
      setError(String(msg));
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <h2 className={styles.title}>Create an account</h2>
        <p className={styles.subtitle}>
          Start monitoring irrigation data and receive smarter alerts.
        </p>

        <form className={styles.form} onSubmit={handleRegister}>
          <label className={styles.inputGroup}>
            <span className={styles.label}>Email address</span>
            <input
              className={styles.input}
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className={styles.inputGroup}>
            <span className={styles.label}>Password</span>
            <input
              className={styles.input}
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <span className={styles.requirement}>
              Use 6 or more characters with a mix of letters and numbers.
            </span>
          </label>

          <Button className={styles.primaryButton} type="submit">
            Create account
          </Button>
        </form>

        <div className={styles.providers}>
          <Button
            className={styles.providerButton}
            type="button"
            onClick={handleGoogle}
          >
            Continue with <img className={styles.icon} src={googleIcon} alt="google" />
          </Button>
          <Button
            className={styles.providerButton}
            type="button"
            onClick={handleGithub}
          >
            Continue with <img className={styles.icon} src={githubIcon} alt="github" />
          </Button>
        </div>

        <p className={styles.error} aria-live="polite">
          {error ? "An error occurred" : "\u00A0"}
        </p>

        <p className={styles.secondaryAction}>
          Already have an account?
          <Link className={styles.link} to="/login">
            Log in
          </Link>
        </p>
      </div>
    </section>
  );
}
