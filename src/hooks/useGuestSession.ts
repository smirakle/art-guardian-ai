import { useState, useEffect } from "react";

const GUEST_SESSION_KEY = "tsmo_guest_session";

export const useGuestSession = () => {
  const [guestSessionId, setGuestSessionId] = useState<string>("");

  useEffect(() => {
    let sessionId = localStorage.getItem(GUEST_SESSION_KEY);
    
    if (!sessionId) {
      sessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem(GUEST_SESSION_KEY, sessionId);
    }
    
    setGuestSessionId(sessionId);
  }, []);

  const clearGuestSession = () => {
    localStorage.removeItem(GUEST_SESSION_KEY);
    setGuestSessionId("");
  };

  return { guestSessionId, clearGuestSession };
};
