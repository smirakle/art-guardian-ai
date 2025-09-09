import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AuthRequest {
  action: 'authenticate' | 'disable_maintenance';
  password?: string;
  sessionToken?: string;
}

function validateInput(data: any): AuthRequest {
  if (!data.action || !['authenticate', 'disable_maintenance'].includes(data.action)) {
    throw new Error('Invalid action. Must be "authenticate" or "disable_maintenance"');
  }
  
  if (data.action === 'authenticate' && (!data.password || typeof data.password !== 'string')) {
    throw new Error('Password is required for authentication');
  }
  
  if (data.action === 'disable_maintenance' && (!data.sessionToken || typeof data.sessionToken !== 'string')) {
    throw new Error('Session token is required to disable maintenance mode');
  }
  
  return {
    action: data.action,
    password: data.password,
    sessionToken: data.sessionToken
  };
}

async function logSecurityEvent(
  supabase: any,
  action: string,
  details: any,
  req: Request
) {
  try {
    const userAgent = req.headers.get('user-agent') || '';
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ipAddress = forwarded || realIp || 'unknown';
    
    await supabase
      .from('security_audit_log')
      .insert({
        user_id: null, // System action
        action,
        resource_type: 'maintenance_mode',
        details,
        ip_address: ipAddress,
        user_agent: userAgent
      });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse and validate request body
    const requestData = await req.json();
    const validatedData = validateInput(requestData);

    if (validatedData.action === 'authenticate') {
      // Authenticate using environment-based admin password
      const adminPassword = Deno.env.get('ADMIN_MAINTENANCE_PASSWORD');
      
      if (!adminPassword) {
        await logSecurityEvent(supabase, 'admin_auth_failed', 
          { error: 'Admin password not configured' }, req);
        
        return new Response(
          JSON.stringify({ error: 'Server configuration error' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Verify the provided password
      if (validatedData.password !== adminPassword) {
        await logSecurityEvent(supabase, 'admin_auth_failed', 
          { error: 'Invalid password' }, req);
        
        return new Response(
          JSON.stringify({ error: 'Invalid admin password' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Generate a secure session token
      const sessionToken = crypto.randomUUID();
      const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '0.0.0.0';
      const userAgent = req.headers.get('user-agent') || '';
      
      // Store the session in the database with hashed token
      const { error: sessionError } = await supabase
        .from('admin_sessions')
        .insert({
          session_token_hash: await supabase.rpc('hash_session_token', { token: sessionToken }),
          expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hour expiry
          ip_address: clientIp,
          user_agent: userAgent
        });

      if (sessionError) {
        console.error('Failed to create admin session:', sessionError);
        return new Response(
          JSON.stringify({ error: 'Failed to create session' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      await logSecurityEvent(supabase, 'admin_auth_success', 
        { sessionToken: sessionToken.substring(0, 8) + '...' }, req);

      return new Response(
        JSON.stringify({ 
          success: true, 
          sessionToken,
          message: 'Admin authenticated successfully'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } else if (validatedData.action === 'disable_maintenance') {
      // Validate the hashed session token
      const isValidSession = await supabase.rpc('is_valid_hashed_admin_session', {
        session_token: validatedData.sessionToken
      });

      if (!isValidSession.data) {

        await logSecurityEvent(supabase, 'maintenance_disable_denied', 
          { error: 'Invalid or expired session token' }, req);
        
        return new Response(
          JSON.stringify({ error: 'Invalid or expired session token' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Deactivate all sessions with this token hash
      await supabase
        .from('admin_sessions')
        .update({ is_active: false })
        .eq('session_token_hash', await supabase.rpc('hash_session_token', { token: validatedData.sessionToken }));

      await logSecurityEvent(supabase, 'maintenance_mode_disabled', 
        { sessionToken: validatedData.sessionToken?.substring(0, 8) + '...' }, req);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Maintenance mode disabled successfully'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Admin maintenance auth error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});