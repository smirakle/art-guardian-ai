import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const VISITOR_ID_KEY = 'tsmo-visitor-id';
const SESSION_ID_KEY = 'tsmo-session-id';
const SESSION_START_KEY = 'tsmo-session-start';
const LAST_PAGE_TIME_KEY = 'tsmo-last-page-time';

interface DeviceInfo {
  deviceType: string;
  browser: string;
  os: string;
}

const getDeviceInfo = (): DeviceInfo => {
  const ua = navigator.userAgent;
  
  // Device type
  let deviceType = 'desktop';
  if (/tablet|ipad/i.test(ua)) deviceType = 'tablet';
  else if (/mobile|iphone|android/i.test(ua)) deviceType = 'mobile';
  
  // Browser
  let browser = 'unknown';
  if (/chrome/i.test(ua) && !/edge|edg/i.test(ua)) browser = 'chrome';
  else if (/firefox/i.test(ua)) browser = 'firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'safari';
  else if (/edge|edg/i.test(ua)) browser = 'edge';
  else if (/opera|opr/i.test(ua)) browser = 'opera';
  
  // OS
  let os = 'unknown';
  if (/windows/i.test(ua)) os = 'windows';
  else if (/macintosh|mac os/i.test(ua)) os = 'macos';
  else if (/linux/i.test(ua) && !/android/i.test(ua)) os = 'linux';
  else if (/android/i.test(ua)) os = 'android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'ios';
  
  return { deviceType, browser, os };
};

const getUTMParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
  };
};

const getOrCreateVisitorId = (): string => {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
};

const createSessionId = (): string => {
  const sessionId = crypto.randomUUID();
  sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  sessionStorage.setItem(SESSION_START_KEY, Date.now().toString());
  return sessionId;
};

const getSessionId = (): string => {
  return sessionStorage.getItem(SESSION_ID_KEY) || createSessionId();
};

// Check if running on Lovable editing platform or development environment
const isLovableEditingPlatform = (): boolean => {
  const hostname = window.location.hostname;
  return (
    hostname.includes('lovableproject.com') ||
    hostname.includes('lovable.app') ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1'
  );
};

export const useVisitorTracking = () => {
  const location = useLocation();
  const { user } = useAuth();
  const sessionInitialized = useRef(false);
  const currentPageStart = useRef(Date.now());
  const lastPath = useRef<string | null>(null);
  
  // Skip all tracking on Lovable editing platform
  const shouldSkipTracking = isLovableEditingPlatform();

  // Initialize session
  const initSession = useCallback(async () => {
    if (shouldSkipTracking) return;
    if (sessionInitialized.current) return;
    sessionInitialized.current = true;
    const visitorId = getOrCreateVisitorId();
    const sessionId = createSessionId();
    const deviceInfo = getDeviceInfo();
    const utmParams = getUTMParams();

    // Check if returning visitor
    const { count } = await supabase
      .from('visitor_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('visitor_id', visitorId);

    const isReturningVisitor = (count || 0) > 0;

    // Create session
    await supabase.from('visitor_sessions').insert({
      session_id: sessionId,
      visitor_id: visitorId,
      user_id: user?.id || null,
      entry_page: window.location.pathname,
      referrer: document.referrer || null,
      device_type: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      is_returning_visitor: isReturningVisitor,
      ...utmParams,
    });

    // Track initial page view
    trackPageView(sessionId, visitorId, window.location.pathname);
  }, [user?.id, shouldSkipTracking]);

  // Track page view
  const trackPageView = useCallback(async (
    sessionId: string, 
    visitorId: string, 
    pagePath: string
  ) => {
    await supabase.from('page_views').insert({
      session_id: sessionId,
      visitor_id: visitorId,
      page_path: pagePath,
      page_title: document.title,
    });

    // Update session page views count and exit page
    const { data: session } = await supabase
      .from('visitor_sessions')
      .select('page_views')
      .eq('session_id', sessionId)
      .single();

    const newPageViews = (session?.page_views || 0) + 1;
    
    await supabase
      .from('visitor_sessions')
      .update({
        page_views: newPageViews,
        exit_page: pagePath,
        is_bounce: newPageViews <= 1,
      })
      .eq('session_id', sessionId);
  }, []);

  // Update time on previous page
  const updatePreviousPageTime = useCallback(async () => {
    const lastPageTime = sessionStorage.getItem(LAST_PAGE_TIME_KEY);
    if (lastPageTime && lastPath.current) {
      const timeOnPage = Math.floor((Date.now() - parseInt(lastPageTime)) / 1000);
      const sessionId = getSessionId();
      
      // Update the most recent page view for this path
      const { data: pageViews } = await supabase
        .from('page_views')
        .select('id')
        .eq('session_id', sessionId)
        .eq('page_path', lastPath.current)
        .order('created_at', { ascending: false })
        .limit(1);

      if (pageViews && pageViews.length > 0) {
        await supabase
          .from('page_views')
          .update({ time_on_page_seconds: timeOnPage })
          .eq('id', pageViews[0].id);
      }
    }
  }, []);

  // Update session duration
  const updateSessionDuration = useCallback(async () => {
    const sessionStart = sessionStorage.getItem(SESSION_START_KEY);
    if (sessionStart) {
      const duration = Math.floor((Date.now() - parseInt(sessionStart)) / 1000);
      const sessionId = getSessionId();
      
      await supabase
        .from('visitor_sessions')
        .update({ duration_seconds: duration })
        .eq('session_id', sessionId);
    }
  }, []);

  // End session
  const endSession = useCallback(async () => {
    await updatePreviousPageTime();
    await updateSessionDuration();
    
    const sessionId = getSessionId();
    await supabase
      .from('visitor_sessions')
      .update({ ended_at: new Date().toISOString() })
      .eq('session_id', sessionId);
  }, [updatePreviousPageTime, updateSessionDuration]);

  // Initialize on mount
  useEffect(() => {
    if (shouldSkipTracking) return;
    initSession();
    // Handle page unload
    const handleBeforeUnload = () => {
      endSession();
    };

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        updateSessionDuration();
        updatePreviousPageTime();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [shouldSkipTracking, initSession, endSession, updateSessionDuration, updatePreviousPageTime]);

  // Track page changes
  useEffect(() => {
    if (shouldSkipTracking) return;
    if (!sessionInitialized.current) return;
    const sessionId = getSessionId();
    const visitorId = getOrCreateVisitorId();
    const currentPath = location.pathname;

    // Update previous page time
    updatePreviousPageTime();

    // Track new page
    if (lastPath.current !== currentPath) {
      trackPageView(sessionId, visitorId, currentPath);
      lastPath.current = currentPath;
      currentPageStart.current = Date.now();
      sessionStorage.setItem(LAST_PAGE_TIME_KEY, Date.now().toString());
    }
  }, [shouldSkipTracking, location.pathname, trackPageView, updatePreviousPageTime]);

  return {
    getVisitorId: getOrCreateVisitorId,
    getSessionId,
  };
};
