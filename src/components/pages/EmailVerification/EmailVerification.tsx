import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { verifyEmail, checkVerificationCode } from "../../../auth/login";
import Button from "../../ui/Button";
import styles from "./EmailVerification.module.css";

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("Verifying your email...");
  const actionCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handleVerification = async () => {
      if (!actionCode) {
        setStatus("error");
        setMessage("Invalid verification link. Please check your email and try again.");
        return;
      }

      if (mode !== "verifyEmail") {
        setStatus("error");
        setMessage("Invalid verification mode.");
        return;
      }

      try {
        await checkVerificationCode(actionCode);

        await verifyEmail(actionCode);

        setStatus("success");
        setMessage("Email verified successfully! Redirecting to dashboard...");

        setTimeout(() => {
          navigate("/", { replace: true });
          window.location.reload();
        }, 2000);
      } catch (err: unknown) {
        setStatus("error");
        if (err instanceof Error) {
          setMessage(err.message || "Verification failed. The link may have expired.");
        } else {
          setMessage("Verification failed. The link may have expired. Please request a new verification email.");
        }
      }
    };

    handleVerification();
  }, [actionCode, mode, navigate]);

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <h2 className={styles.title}>
          {status === "verifying" && "Verifying Email"}
          {status === "success" && "Email Verified!"}
          {status === "error" && "Verification Failed"}
        </h2>

        <div className={styles.content}>
          {status === "verifying" && (
            <div className={styles.spinner}></div>
          )}
          {status === "success" && (
            <div className={styles.successIcon}>✓</div>
          )}
          {status === "error" && (
            <div className={styles.errorIcon}>✗</div>
          )}

          <p className={styles.message}>{message}</p>
        </div>

        {status === "success" && (
          <p className={styles.redirectMessage}>
            Redirecting to dashboard...
          </p>
        )}

        {status === "error" && (
          <div className={styles.actions}>
            <Link to="/register">
              <Button className={styles.button}>Go to Register</Button>
            </Link>
            <Link to="/login">
              <Button className={styles.button}>Go to Login</Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default EmailVerification;

