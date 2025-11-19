import { useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";

import { auth, authReady } from "../services/Firebase";
import type { AuthContextValue } from "./AuthContext";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let cancelled = false;

    const initialize = async () => {
      await authReady;

      if (cancelled) {
        return;
      }

      unsubscribe = onAuthStateChanged(auth, (nextUser) => {
        setUser(nextUser);
        setLoading(false);
      });
    };

    initialize();

    return () => {
      cancelled = true;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      logout: () => signOut(auth),
    }),
    [user, loading],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

