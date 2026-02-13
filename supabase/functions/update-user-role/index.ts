import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // This function now redirects to the secure role management function
    return new Response(
      JSON.stringify({ 
        error: 'This endpoint has been deprecated for security reasons. Please use the secure-role-management function instead.',
        redirect: '/functions/v1/secure-role-management'
      }),
      { 
        status: 410, // Gone
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in deprecated role management function:', error);
    
    return new Response(
      JSON.stringify({ error: 'Function deprecated' }),
      { 
        status: 410, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});