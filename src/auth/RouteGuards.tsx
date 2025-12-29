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

  // For Gmail accounts, require email verification
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

  // Allow access if user is authenticated but not verified (Gmail accounts)
  // This allows them to log out or use a different account
  if (user && (!isGmail || isEmailVerified)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/**
 * Route guard for pages that require authentication but allow unverified Gmail users
 * (e.g., the verify-required page)
 */
export const AuthenticatedRoute = ({ children }: RouteGuardProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/register" replace />;
  }

  return children;
};


