import { useState, type PropsWithChildren, useMemo } from "react";
import type { LiveContextValue } from "./LiveContext";
import { LiveContext } from "./LiveContext";

export const LiveProvider = ({ children }: PropsWithChildren) => {
  const [isLive, setIsLive] = useState(false);

  const value = useMemo<LiveContextValue>(
    () => ({
      isLive,
      setIsLive,
    }),
    [isLive],
  );

  return (
    <LiveContext.Provider value={value}>{children}</LiveContext.Provider>
  );
};






