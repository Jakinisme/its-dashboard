import { useContext } from "react";
import { LiveContext } from "../contexts/LiveContext";

export const useLive = () => {
  const context = useContext(LiveContext);

  if (context === undefined) {
    throw new Error("useLive must be used within a LiveProvider");
  }

  return context;
};








