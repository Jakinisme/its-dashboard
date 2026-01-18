import { useEffect } from "react";
import { auth } from "../services/Firebase";

export const useTokenRefresh = () => {
  useEffect(() => {
    console.log("[useTokenRefresh] Starting automatic token refresh");
    
    const REFRESH_INTERVAL = 50 * 60 * 1000;
    
    const interval = setInterval(async () => {
      const user = auth.currentUser;
      
      if (!user) {
        console.log("[useTokenRefresh] No user logged in, skipping refresh");
        return;
      }
      
      try {
        console.log("[useTokenRefresh] Refreshing token...");
        
        const newToken = await user.getIdToken(true);
        
        console.log(`[useTokenRefresh] ✓ Token refreshed (${newToken.length} chars)`);
        
      } catch (error) {
        console.error("[useTokenRefresh] ✗ Failed to refresh token:", error);
      }
    }, REFRESH_INTERVAL);
    
    return () => {
      console.log("[useTokenRefresh] Stopping automatic token refresh");
      clearInterval(interval);
    };
  }, []);
};