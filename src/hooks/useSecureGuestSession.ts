import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const SECURE_GUEST_SESSION_KEY = "tsmo_secure_guest_session";

interface SecureGuestSession {
  sessionToken: string;
  sessionId: string;
  expiresAt: string;
  maxUploads: number;
}

interface SessionStatus {
  valid: boolean;
  uploadsUsed: number;
  uploadsRemaining: number;
  error?: string;
}

export const useSecureGuestSession = () => {
  const [session, setSession] = useState<SecureGuestSession | null>(null);
  const [status, setStatus] = useState<SessionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load existing session from storage
  useEffect(() => {
    const stored = localStorage.getItem(SECURE_GUEST_SESSION_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as SecureGuestSession;
        // Check if not expired
        if (new Date(parsed.expiresAt) > new Date()) {
          setSession(parsed);
          validateSession(parsed.sessionToken);
        } else {
          localStorage.removeItem(SECURE_GUEST_SESSION_KEY);
        }
      } catch {
        localStorage.removeItem(SECURE_GUEST_SESSION_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const validateSession = async (token: string): Promise<SessionStatus> => {
    try {
      const { data, error } = await supabase.functions.invoke('create-guest-session', {
        body: { action: 'validate', sessionToken: token }
      });

      if (error || !data?.valid) {
        const errorStatus = { 
          valid: false, 
          uploadsUsed: 0, 
          uploadsRemaining: 0, 
          error: data?.error || 'Session invalid' 
        };
        setStatus(errorStatus);
        return errorStatus;
      }

      const validStatus = {
        valid: true,
        uploadsUsed: data.uploadsUsed,
        uploadsRemaining: data.uploadsRemaining
      };
      setStatus(validStatus);
      return validStatus;
    } catch (err) {
      console.error('[useSecureGuestSession] Validation error:', err);
      const errorStatus = { valid: false, uploadsUsed: 0, uploadsRemaining: 0, error: 'Validation failed' };
      setStatus(errorStatus);
      return errorStatus;
    }
  };

  const createSession = useCallback(async (): Promise<SecureGuestSession | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-guest-session', {
        body: { action: 'create' }
      });

      if (error || !data?.success) {
        console.error('[useSecureGuestSession] Create error:', error || data?.error);
        setIsLoading(false);
        return null;
      }

      const newSession: SecureGuestSession = {
        sessionToken: data.sessionToken,
        sessionId: data.sessionId,
        expiresAt: data.expiresAt,
        maxUploads: data.maxUploads
      };

      localStorage.setItem(SECURE_GUEST_SESSION_KEY, JSON.stringify(newSession));
      setSession(newSession);
      setStatus({
        valid: true,
        uploadsUsed: 0,
        uploadsRemaining: data.maxUploads
      });
      setIsLoading(false);
      return newSession;
    } catch (err) {
      console.error('[useSecureGuestSession] Create error:', err);
      setIsLoading(false);
      return null;
    }
  }, []);

  const getOrCreateSession = useCallback(async (): Promise<SecureGuestSession | null> => {
    // Check if we have a valid session
    if (session && status?.valid) {
      return session;
    }

    // Try to validate existing session
    if (session) {
      const validationResult = await validateSession(session.sessionToken);
      if (validationResult.valid) {
        return session;
      }
    }

    // Create new session
    return createSession();
  }, [session, status, createSession]);

  const recordUpload = useCallback(async (): Promise<boolean> => {
    if (!session) return false;

    try {
      const { data, error } = await supabase.functions.invoke('create-guest-session', {
        body: { action: 'increment', sessionToken: session.sessionToken }
      });

      if (!error && data?.success) {
        // Refresh status
        await validateSession(session.sessionToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [session]);

  const clearSession = useCallback(() => {
    localStorage.removeItem(SECURE_GUEST_SESSION_KEY);
    setSession(null);
    setStatus(null);
  }, []);

  const canUpload = status?.valid && (status.uploadsRemaining > 0);

  return {
    session,
    status,
    isLoading,
    canUpload,
    getOrCreateSession,
    recordUpload,
    clearSession,
    validateSession: session ? () => validateSession(session.sessionToken) : async () => ({ valid: false, uploadsUsed: 0, uploadsRemaining: 0 })
  };
};
