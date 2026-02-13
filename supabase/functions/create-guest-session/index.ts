import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generateSecureToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get client IP from headers
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIp = forwardedFor?.split(',')[0]?.trim() || realIp || '0.0.0.0';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'create';
    
    if (action === 'validate') {
      // Validate existing session
      const sessionToken = body.sessionToken;
      if (!sessionToken) {
        return new Response(
          JSON.stringify({ valid: false, error: 'No session token provided' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const tokenHash = await hashToken(sessionToken);
      
      const { data: session, error } = await supabase
        .from('guest_sessions')
        .select('*')
        .eq('session_token_hash', tokenHash)
        .eq('is_valid', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !session) {
        console.log('[create-guest-session] Invalid session token');
        return new Response(
          JSON.stringify({ valid: false, error: 'Invalid or expired session' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (session.upload_count >= session.max_uploads) {
        return new Response(
          JSON.stringify({ 
            valid: false, 
            error: 'Upload limit reached',
            uploads_used: session.upload_count,
            max_uploads: session.max_uploads
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          valid: true,
          sessionId: session.id,
          uploadsUsed: session.upload_count,
          uploadsRemaining: session.max_uploads - session.upload_count
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'increment') {
      // Increment upload count
      const sessionToken = body.sessionToken;
      if (!sessionToken) {
        return new Response(
          JSON.stringify({ success: false, error: 'No session token provided' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const tokenHash = await hashToken(sessionToken);
      
      const { data, error } = await supabase
        .from('guest_sessions')
        .update({ upload_count: supabase.rpc('increment_counter') })
        .eq('session_token_hash', tokenHash)
        .eq('is_valid', true)
        .select()
        .single();

      // Simpler approach - just increment directly
      const { error: updateError } = await supabase.rpc('validate_guest_session', {
        p_session_token: sessionToken
      });

      if (updateError) {
        console.error('[create-guest-session] Increment error:', updateError);
      }

      return new Response(
        JSON.stringify({ success: !updateError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create new session
    // First check IP rate limit
    const { data: rateLimitResult } = await supabase.rpc('check_guest_ip_rate_limit', {
      p_ip_address: clientIp,
      p_max_requests: 10 // Max 10 sessions per hour per IP
    });

    if (rateLimitResult && !rateLimitResult.allowed) {
      console.log('[create-guest-session] Rate limit exceeded for IP:', clientIp);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: rateLimitResult.retry_after
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate secure session token
    const sessionToken = generateSecureToken();
    const tokenHash = await hashToken(sessionToken);
    
    // Calculate expiry (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Insert session
    const { data: session, error } = await supabase
      .from('guest_sessions')
      .insert({
        session_token: sessionToken.substring(0, 8) + '...', // Store partial for debugging
        session_token_hash: tokenHash,
        ip_address: clientIp,
        user_agent: userAgent.substring(0, 255),
        expires_at: expiresAt,
        upload_count: 0,
        max_uploads: 5,
        is_valid: true
      })
      .select()
      .single();

    if (error) {
      console.error('[create-guest-session] Error creating session:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[create-guest-session] Created session for IP:', clientIp);

    return new Response(
      JSON.stringify({
        success: true,
        sessionToken,
        sessionId: session.id,
        expiresAt,
        maxUploads: 5
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[create-guest-session] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
