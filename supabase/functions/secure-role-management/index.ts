import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RoleChangeRequest {
  userId: string;
  newRole: 'admin' | 'user';
  reason?: string;
}

function validateInput(data: any): RoleChangeRequest {
  if (!data.userId || typeof data.userId !== 'string') {
    throw new Error('Invalid userId provided');
  }
  
  if (!data.newRole || !['admin', 'user'].includes(data.newRole)) {
    throw new Error('Invalid role provided. Must be "admin" or "user"');
  }
  
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(data.userId)) {
    throw new Error('Invalid userId format');
  }
  
  return {
    userId: data.userId,
    newRole: data.newRole,
    reason: data.reason ? String(data.reason).substring(0, 500) : undefined // Limit reason length
  };
}

async function logSecurityEvent(
  supabase: any,
  userId: string | null,
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
        user_id: userId,
        action,
        resource_type: 'user_roles',
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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify the user's JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      await logSecurityEvent(supabase, null, 'unauthorized_role_change_attempt', 
        { error: 'Invalid token', authError }, req);
      
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if user is admin
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || userRole?.role !== 'admin') {
      await logSecurityEvent(supabase, user.id, 'unauthorized_role_change_attempt', 
        { error: 'Insufficient privileges', userRole: userRole?.role }, req);
      
      return new Response(
        JSON.stringify({ error: 'Insufficient privileges. Admin access required.' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

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

    // Prevent self-demotion of the last admin
    if (validatedData.newRole === 'user' && validatedData.userId === user.id) {
      const { data: adminCount } = await supabase
        .from('user_roles')
        .select('id', { count: 'exact' })
        .eq('role', 'admin');

      if (adminCount && adminCount.length <= 1) {
        await logSecurityEvent(supabase, user.id, 'prevented_last_admin_demotion', 
          { targetUserId: validatedData.userId }, req);
        
        return new Response(
          JSON.stringify({ error: 'Cannot demote the last admin user' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Get current role for logging
    const { data: currentRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', validatedData.userId)
      .single();

    // Update the user's role
    const { error: updateError } = await supabase
      .from('user_roles')
      .update({ role: validatedData.newRole })
      .eq('user_id', validatedData.userId);

    if (updateError) {
      await logSecurityEvent(supabase, user.id, 'role_change_failed', 
        { 
          targetUserId: validatedData.userId, 
          newRole: validatedData.newRole,
          error: updateError.message 
        }, req);
      
      return new Response(
        JSON.stringify({ error: 'Failed to update user role' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log successful role change
    await logSecurityEvent(supabase, user.id, 'role_change_success', 
      { 
        targetUserId: validatedData.userId, 
        oldRole: currentRole?.role,
        newRole: validatedData.newRole,
        reason: validatedData.reason 
      }, req);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `User role updated to ${validatedData.newRole}` 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Role management error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});