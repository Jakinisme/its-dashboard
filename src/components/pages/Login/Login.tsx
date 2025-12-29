import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import {
  loginWithEmail,
  loginWithGoogle,
  loginWithGithub,
  isGmail,
} from "../../../auth/login";

import googleIcon from "../../../assets/icons/google.svg";
import githubIcon from "../../../assets/icons/github.svg";

import Button from "../../ui/Button";
import styles from "./Login.module.css";

export default function Login() {
  const navigate = useNavigate();
  const { user, isGmail: userIsGmail, isEmailVerified } = useAuth();
  
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  // Redirect when user is authenticated and verified
  useEffect(() => {
    if (user && userIsGmail && !isEmailVerified) {
      navigate("/verify-required", { replace: true });
    } else if (user && (!userIsGmail || isEmailVerified)) {
      navigate("/", { replace: true });
    }
  }, [user, userIsGmail, isEmailVerified, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    
    // Validate Gmail for email/password login
    if (!isGmail(email)) {
      setError("Please use a Gmail address (@gmail.com) to log in.");
      return;
    }
    
    try {
      await loginWithEmail(email, password);
      // Navigation will happen automatically via useEffect when auth state updates
    } catch (msg) {
      setError(String(msg));
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await loginWithGoogle();
      // Navigation will happen automatically via useEffect when auth state updates
    } catch (msg) {
      setError(String(msg));
    }
  };

  const handleGithub = async () => {
    setError("");
    try {
      await loginWithGithub();
      // Navigation will happen automatically via useEffect when auth state updates
    } catch (msg) {
      setError(String(msg));
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <h2 className={styles.title}>Welcome back</h2>
        <p className={styles.subtitle}>
          Sign in to access moisture insights and keep your crops on track.
        </p>

        <form className={styles.form} onSubmit={handleEmailLogin}>
          <label className={styles.inputGroup}>
            <span className={styles.label}>Email</span>
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
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </label>

          <div className={styles.actions}>
            <Button className={styles.primaryButton} type="submit">
              Login with Email
            </Button>
          </div>
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
          {error}
        </p>

        <p className={styles.secondaryAction}>
          New to Dashboard?
          <Link className={styles.link} to="/register">
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}
