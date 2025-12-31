import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import { useAuth } from "../hooks/useAuth";

interface RouteGuardProps {
  children: ReactNode;
}

const LoadingFallback = () => (
  <div>Wait</div>
);

export const ProtectedRoute = ({ children }: RouteGuardProps) => {
  const { user, loading, isEmailVerified, isGmail } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/register" replace />;
  }

  if (isGmail && !isEmailVerified) {
    return <Navigate to="/verify-required" replace />;
  }

  return children;
};

export const PublicRoute = ({ children }: RouteGuardProps) => {
  const { user, loading, isEmailVerified, isGmail } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (user && (!isGmail || isEmailVerified)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export const AuthenticatedRoute = ({ children }: RouteGuardProps) => {
  const { user, loading, isEmailVerified, isGmail } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/register" replace />;
  }

  if (isGmail && isEmailVerified) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export const VerificationRoute = ({ children }: RouteGuardProps) => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const oobCode = urlParams.get("oobCode");

  if (!oobCode) {
    return <Navigate to="/register" replace />;
  }

  return children;
};


