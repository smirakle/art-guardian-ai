import { useEffect } from 'react';

// Government-grade security headers component
const SecurityHeaders = () => {
  useEffect(() => {
    // Set security headers via meta tags for additional protection
    const setSecurityMeta = () => {
      // Content Security Policy
      const cspMeta = document.createElement('meta');
      cspMeta.httpEquiv = 'Content-Security-Policy';
      cspMeta.content = `
        default-src 'self' https:;
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://utneaqmbyjwxaqrrarpc.supabase.co;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        font-src 'self' https://fonts.gstatic.com;
        img-src 'self' data: https: blob:;
        connect-src 'self' https://utneaqmbyjwxaqrrarpc.supabase.co wss://utneaqmbyjwxaqrrarpc.supabase.co;
        frame-ancestors 'none';
        base-uri 'self';
        form-action 'self';
        upgrade-insecure-requests;
      `.replace(/\s+/g, ' ').trim();
      document.head.appendChild(cspMeta);

      // X-Content-Type-Options
      const noSniffMeta = document.createElement('meta');
      noSniffMeta.httpEquiv = 'X-Content-Type-Options';
      noSniffMeta.content = 'nosniff';
      document.head.appendChild(noSniffMeta);

      // X-Frame-Options
      const frameOptionsMeta = document.createElement('meta');
      frameOptionsMeta.httpEquiv = 'X-Frame-Options';
      frameOptionsMeta.content = 'DENY';
      document.head.appendChild(frameOptionsMeta);

      // Referrer Policy
      const referrerMeta = document.createElement('meta');
      referrerMeta.name = 'referrer';
      referrerMeta.content = 'strict-origin-when-cross-origin';
      document.head.appendChild(referrerMeta);

      // Permissions Policy
      const permissionsMeta = document.createElement('meta');
      permissionsMeta.httpEquiv = 'Permissions-Policy';
      permissionsMeta.content = 'geolocation=(), microphone=(), camera=(), payment=(), usb=()';
      document.head.appendChild(permissionsMeta);
    };

    setSecurityMeta();
  }, []);

  return null;
};

export default SecurityHeaders;