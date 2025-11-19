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
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/register" replace />;
  }

  return children;
};

export const PublicRoute = ({ children }: RouteGuardProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};


