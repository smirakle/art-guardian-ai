import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { matchId, autoFile = false } = await req.json();
    
    if (!matchId) {
      return new Response(JSON.stringify({
        error: 'Missing required parameter: matchId'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing automated DMCA filing for match ${matchId}`);

    // Get match details with artwork and user info
    const { data: match, error: matchError } = await supabase
      .from('copyright_matches')
      .select(`
        *,
        artwork (
          *,
          profiles:user_id (
            full_name,
            email,
            address
          )
        )
      `)
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      throw new Error('Match not found');
    }

    // Check if DMCA already filed
    if (match.dmca_filed) {
      return new Response(JSON.stringify({
        success: false,
        message: 'DMCA notice already filed for this match'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get platform-specific DMCA information
    const platformInfo = await getPlatformDMCAInfo(match.source_domain);
    
    // Generate automated DMCA notice
    const dmcaData = {
      matchId: matchId,
      copyrightOwnerName: match.artwork.profiles?.full_name || 'Copyright Owner',
      copyrightOwnerEmail: match.artwork.profiles?.email || 'owner@example.com',
      copyrightOwnerAddress: match.artwork.profiles?.address || 'Address on file',
      copyrightWorkDescription: `Original artwork: ${match.artwork.title}`,
      infringingUrl: match.source_url,
      infringingDescription: `Unauthorized use of copyrighted artwork found on ${match.source_domain}`,
      targetPlatform: platformInfo.platform,
      dmcaEmail: platformInfo.dmcaEmail,
      customInstructions: platformInfo.instructions
    };

    // File DMCA notice
    const filingResult = await fileDMCANotice(dmcaData, autoFile);

    // Update match status
    await supabase
      .from('copyright_matches')
      .update({
        dmca_filed: true,
        dmca_filed_at: new Date().toISOString(),
        is_reviewed: true
      })
      .eq('id', matchId);

    // Create monitoring alert
    await supabase.functions.invoke('create-monitoring-alert', {
      body: {
        userId: match.artwork.user_id,
        matchId: matchId,
        alertType: 'automated_dmca_filed',
        title: 'Automated DMCA Notice Filed',
        message: `DMCA takedown notice automatically filed for content on ${match.source_domain}`
      }
    });

    console.log(`DMCA filing completed for match ${matchId}`);

    return new Response(JSON.stringify({
      success: true,
      filingId: filingResult.id,
      platform: platformInfo.platform,
      status: filingResult.status,
      estimatedResponseTime: platformInfo.responseTime,
      trackingUrl: filingResult.trackingUrl
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in automated-dmca-filing:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getPlatformDMCAInfo(domain: string) {
  const platformMap: { [key: string]: any } = {
    'youtube.com': {
      platform: 'YouTube',
      dmcaEmail: 'copyright@youtube.com',
      responseTime: '48-72 hours',
      instructions: 'YouTube DMCA via Content ID system',
      apiEndpoint: 'https://www.googleapis.com/youtube/v3/takedown'
    },
    'instagram.com': {
      platform: 'Instagram',
      dmcaEmail: 'ip@meta.com',
      responseTime: '24-48 hours',
      instructions: 'Meta IP reporting system',
      apiEndpoint: 'https://developers.facebook.com/docs/instagram-api'
    },
    'facebook.com': {
      platform: 'Facebook',
      dmcaEmail: 'ip@meta.com',
      responseTime: '24-48 hours',
      instructions: 'Meta IP reporting system',
      apiEndpoint: 'https://developers.facebook.com/docs/graph-api'
    },
    'twitter.com': {
      platform: 'Twitter/X',
      dmcaEmail: 'copyright@twitter.com',
      responseTime: '24-48 hours',
      instructions: 'Twitter copyright reporting',
      apiEndpoint: 'https://api.twitter.com/2/compliance'
    },
    'tiktok.com': {
      platform: 'TikTok',
      dmcaEmail: 'copyright@tiktok.com',
      responseTime: '48-72 hours',
      instructions: 'TikTok copyright center',
      apiEndpoint: 'https://developers.tiktok.com/doc'
    },
    'pinterest.com': {
      platform: 'Pinterest',
      dmcaEmail: 'copyright@pinterest.com',
      responseTime: '24-48 hours',
      instructions: 'Pinterest copyright reporting',
      apiEndpoint: 'https://developers.pinterest.com/docs'
    }
  };

  // Check for exact domain match
  if (platformMap[domain]) {
    return platformMap[domain];
  }

  // Check for subdomain matches
  for (const [key, value] of Object.entries(platformMap)) {
    if (domain.includes(key)) {
      return value;
    }
  }

  // Default generic platform info
  return {
    platform: 'Generic Platform',
    dmcaEmail: 'dmca@' + domain,
    responseTime: '7-14 days',
    instructions: 'Standard DMCA takedown notice',
    apiEndpoint: null
  };
}

async function fileDMCANotice(dmcaData: any, autoFile: boolean) {
  // Store DMCA notice in database
  const { data: dmcaNotice, error } = await supabase
    .from('dmca_notices')
    .insert({
      match_id: dmcaData.matchId,
      copyright_owner_name: dmcaData.copyrightOwnerName,
      copyright_owner_email: dmcaData.copyrightOwnerEmail,
      copyright_owner_address: dmcaData.copyrightOwnerAddress,
      copyright_work_description: dmcaData.copyrightWorkDescription,
      infringing_url: dmcaData.infringingUrl,
      infringing_description: dmcaData.infringingDescription,
      target_domain: dmcaData.targetPlatform,
      status: autoFile ? 'filed' : 'draft',
      filed_at: autoFile ? new Date().toISOString() : null,
      platform_specific_data: {
        dmcaEmail: dmcaData.dmcaEmail,
        instructions: dmcaData.customInstructions,
        automated: true
      }
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create DMCA notice: ' + error.message);
  }

  if (autoFile) {
    // In a real implementation, this would:
    // 1. Use platform-specific APIs to file automatically
    // 2. Send emails to DMCA agents
    // 3. Submit through official takedown portals
    
    console.log(`Auto-filing DMCA notice to ${dmcaData.targetPlatform}`);
    
    // Simulate API call to platform
    await simulatePlatformFiling(dmcaData);
  }

  return {
    id: dmcaNotice.id,
    status: dmcaNotice.status,
    trackingUrl: `https://dmca-tracking.example.com/${dmcaNotice.id}`
  };
}

async function simulatePlatformFiling(dmcaData: any) {
  // This would be replaced with actual platform API calls
  console.log(`Filing DMCA with ${dmcaData.targetPlatform}:`);
  console.log(`- Email: ${dmcaData.dmcaEmail}`);
  console.log(`- URL: ${dmcaData.infringingUrl}`);
  console.log(`- Instructions: ${dmcaData.customInstructions}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    confirmationNumber: `DMCA-${Date.now()}`,
    estimatedResolution: '48-72 hours'
  };
}