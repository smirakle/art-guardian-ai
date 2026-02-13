import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SSLCheckRequest {
  domains?: string[];
  action: 'check' | 'get_status';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { domains, action }: SSLCheckRequest = await req.json();

    if (action === 'get_status') {
      // Get latest SSL certificate status from database
      const { data: certificates, error } = await supabaseClient
        .from('ssl_certificates')
        .select('*')
        .order('last_checked', { ascending: false })
        .limit(10);

      if (error) throw error;

      return new Response(
        JSON.stringify({ certificates }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'check' && domains && domains.length > 0) {
      const results = [];

      for (const domain of domains) {
        try {
          const certInfo = await checkSSLCertificate(domain);
          
          // Upsert certificate info to database
          const { error: upsertError } = await supabaseClient
            .from('ssl_certificates')
            .upsert({
              domain: domain,
              issuer: certInfo.issuer,
              subject: certInfo.subject,
              valid_from: certInfo.validFrom,
              valid_to: certInfo.validTo,
              days_until_expiry: certInfo.daysUntilExpiry,
              is_valid: certInfo.isValid,
              protocol_version: certInfo.protocolVersion,
              cipher_suite: certInfo.cipherSuite,
              status: certInfo.status,
              error_message: certInfo.errorMessage,
              certificate_chain: certInfo.certificateChain,
              metadata: certInfo.metadata,
              last_checked: new Date().toISOString(),
            }, {
              onConflict: 'domain',
            });

          if (upsertError) {
            console.error(`Error upserting certificate for ${domain}:`, upsertError);
          }

          results.push({
            domain,
            ...certInfo
          });
        } catch (error) {
          console.error(`Error checking SSL for ${domain}:`, error);
          results.push({
            domain,
            isValid: false,
            status: 'error',
            errorMessage: error.message
          });
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          results,
          message: `Checked ${results.length} domains` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action or missing domains' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ssl-certificate-monitor:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function checkSSLCertificate(domain: string) {
  try {
    // Clean domain (remove protocol if present)
    const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0];
    
    // Connect to the domain via HTTPS
    const conn = await Deno.connectTls({
      hostname: cleanDomain,
      port: 443,
    });

    // Get certificate information
    const cert = await conn.handshake();
    await conn.close();

    // Parse certificate dates
    const validFrom = new Date(cert.validFrom);
    const validTo = new Date(cert.validTo);
    const now = new Date();
    
    // Calculate days until expiry
    const daysUntilExpiry = Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Determine status
    let status = 'valid';
    if (now > validTo) {
      status = 'expired';
    } else if (daysUntilExpiry < 30) {
      status = 'expiring_soon';
    }

    return {
      issuer: cert.issuer || 'Unknown',
      subject: cert.subject || cleanDomain,
      validFrom: validFrom.toISOString(),
      validTo: validTo.toISOString(),
      daysUntilExpiry,
      isValid: now >= validFrom && now <= validTo,
      protocolVersion: cert.protocolVersion || 'TLS 1.3',
      cipherSuite: cert.cipherSuite || 'Unknown',
      status,
      errorMessage: null,
      certificateChain: [],
      metadata: {
        subjectAltNames: cert.subjectAltNames || [],
        serialNumber: cert.serialNumber || '',
      }
    };
  } catch (error) {
    console.error(`SSL check error for ${domain}:`, error);
    return {
      issuer: null,
      subject: domain,
      validFrom: null,
      validTo: null,
      daysUntilExpiry: 0,
      isValid: false,
      protocolVersion: null,
      cipherSuite: null,
      status: 'error',
      errorMessage: error.message,
      certificateChain: [],
      metadata: {}
    };
  }
}
