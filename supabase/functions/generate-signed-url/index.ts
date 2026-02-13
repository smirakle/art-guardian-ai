import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create service client for storage operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user token
    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { bucket, path, expiresIn = 3600 } = body; // Default 1 hour

    if (!bucket || !path) {
      return new Response(
        JSON.stringify({ error: 'Bucket and path are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate bucket is one of the private buckets
    const privateBuckets = ['mobile-apps', 'nft-assets', 'protected-artwork', 'protected-documents'];
    if (!privateBuckets.includes(bucket)) {
      return new Response(
        JSON.stringify({ error: 'Invalid bucket' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Security check: Verify the path belongs to the user
    // Path format is typically: userId/filename or similar
    const pathParts = path.split('/');
    const pathUserId = pathParts[0];
    
    // Check if user has access to this path
    // Allow if: path starts with user's ID OR user is admin
    const { data: userRoles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    const isAdmin = userRoles?.role === 'admin';
    const isOwner = pathUserId === user.id;
    
    if (!isOwner && !isAdmin) {
      // Additional check: see if user owns the artwork/document
      const { data: artwork } = await supabaseAdmin
        .from('artwork')
        .select('id')
        .eq('user_id', user.id)
        .or(`file_paths.cs.{${path}}`)
        .single();
      
      const { data: protectionRecord } = await supabaseAdmin
        .from('ai_protection_records')
        .select('id')
        .eq('user_id', user.id)
        .eq('protected_file_path', path)
        .single();

      if (!artwork && !protectionRecord) {
        console.log('[generate-signed-url] Access denied for user:', user.id, 'path:', path);
        return new Response(
          JSON.stringify({ error: 'Access denied to this file' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate expiry time (max 7 days = 604800 seconds)
    const validExpiresIn = Math.min(Math.max(60, expiresIn), 604800);

    // Generate signed URL using service role
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(path, validExpiresIn);

    if (error) {
      console.error('[generate-signed-url] Error creating signed URL:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to generate signed URL' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[generate-signed-url] Generated URL for user:', user.id, 'bucket:', bucket);

    // Log access for security auditing
    await supabaseAdmin
      .from('ai_protection_audit_log')
      .insert({
        user_id: user.id,
        action: 'generate_signed_url',
        resource_type: 'storage',
        resource_id: `${bucket}/${path}`,
        details: { bucket, path, expiresIn: validExpiresIn }
      })
      .catch(err => console.warn('[generate-signed-url] Audit log error:', err));

    return new Response(
      JSON.stringify({
        signedUrl: data.signedUrl,
        expiresAt: new Date(Date.now() + validExpiresIn * 1000).toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[generate-signed-url] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
