import { createContext } from "react";

export interface LiveContextValue {
  isLive: boolean;
  setIsLive: (value: boolean) => void;
}

export const LiveContext = createContext<LiveContextValue | undefined>(
  undefined,
);








