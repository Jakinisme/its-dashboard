import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { sendVerificationEmail } from "../../../auth/login";
import Button from "../../ui/Button";
import styles from "./VerifyRequired.module.css";

const VerifyRequired = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  const handleResendEmail = async () => {
    setError("");
    setMessage("");
    setIsSending(true);

    try {
      await sendVerificationEmail();
      setMessage("Verification email sent! Please check your inbox.");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to send verification email. Please try again.");
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <h2 className={styles.title}>Email Verification Required</h2>
        <p className={styles.subtitle}>
          Please verify your Gmail address to access the dashboard.
        </p>

        <div className={styles.content}>
          <div className={styles.icon}>✉️</div>
          <p className={styles.message}>
            We've sent a verification email to <strong>{user?.email}</strong>.
            Please check your inbox and click the verification link <strong>(check spam, if you can't find the email)</strong>.
          </p>
        </div>

        {message && (
          <p className={styles.success}>{message}</p>
        )}

        {error && (
          <p className={styles.error}>{error}</p>
        )}

        <div className={styles.actions}>
          <Button
            className={styles.button}
            onClick={handleResendEmail}
            disabled={isSending}
          >
            {isSending ? "Sending..." : "Resend Verification Email"}
          </Button>
        </div>

        <p className={styles.secondaryAction}>
          Want to use a different account?
          <button className={styles.linkButton} onClick={handleLogout}>
            Log in
          </button>
        </p>
      </div>
    </section>
  );
};

export default VerifyRequired;

