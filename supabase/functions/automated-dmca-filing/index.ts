import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

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
      status: autoFile ? 'filing_in_progress' : 'draft',
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
    try {
      console.log(`Filing DMCA notice to ${dmcaData.targetPlatform} via email`);
      
      // Send actual DMCA notice via email
      const emailResult = await sendDMCAEmail(dmcaData, dmcaNotice.id);
      
      // Update notice with email delivery status
      await supabase
        .from('dmca_notices')
        .update({
          status: emailResult.success ? 'filed' : 'failed',
          platform_specific_data: {
            ...dmcaNotice.platform_specific_data,
            email_result: emailResult,
            message_id: emailResult.messageId,
            delivery_timestamp: new Date().toISOString()
          }
        })
        .eq('id', dmcaNotice.id);

      console.log(`DMCA notice email sent: ${emailResult.success ? 'Success' : 'Failed'}`);
      
    } catch (emailError) {
      console.error('Failed to send DMCA email:', emailError);
      
      // Update status to failed
      await supabase
        .from('dmca_notices')
        .update({
          status: 'failed',
          platform_specific_data: {
            ...dmcaNotice.platform_specific_data,
            error: emailError.message,
            failed_at: new Date().toISOString()
          }
        })
        .eq('id', dmcaNotice.id);
    }
  }

  return {
    id: dmcaNotice.id,
    status: autoFile ? 'filed' : 'draft',
    trackingUrl: `https://tsmo.com/dmca-tracking/${dmcaNotice.id}`
  };
}

async function sendDMCAEmail(dmcaData: any, noticeId: string) {
  try {
    const dmcaNoticeText = generateDMCANoticeText(dmcaData, noticeId);
    
    const emailResponse = await resend.emails.send({
      from: 'TSMO Legal <legal@tsmo.com>',
      to: [dmcaData.dmcaEmail],
      cc: [dmcaData.copyrightOwnerEmail],
      subject: `DMCA Takedown Notice - ${dmcaData.targetPlatform} - Reference: TSMO-${noticeId}`,
      html: `
        <h2>DMCA Takedown Notice</h2>
        <p><strong>To:</strong> ${dmcaData.targetPlatform} DMCA Agent</p>
        <p><strong>From:</strong> ${dmcaData.copyrightOwnerName}</p>
        <p><strong>Reference:</strong> TSMO-${noticeId}</p>
        <p><strong>Date:</strong> ${new Date().toISOString().split('T')[0]}</p>
        
        <hr>
        
        <pre style="font-family: Arial, sans-serif; white-space: pre-wrap; line-height: 1.4;">${dmcaNoticeText}</pre>
        
        <hr>
        
        <p><em>This notice was sent via TSMO Copyright Protection System. For questions, contact legal@tsmo.com</em></p>
      `,
      text: dmcaNoticeText,
      headers: {
        'X-TSMO-Notice-ID': noticeId,
        'X-Platform': dmcaData.targetPlatform
      }
    });

    return {
      success: true,
      messageId: emailResponse.data?.id,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      messageId: null,
      error: error.message
    };
  }
}

function generateDMCANoticeText(dmcaData: any, noticeId: string): string {
  return `DIGITAL MILLENNIUM COPYRIGHT ACT TAKEDOWN NOTICE

Notice ID: TSMO-${noticeId}
Date: ${new Date().toISOString().split('T')[0]}

To: ${dmcaData.targetPlatform} DMCA Agent
Email: ${dmcaData.dmcaEmail}

I am writing to notify you of copyright infringement occurring on your platform.

IDENTIFICATION OF COPYRIGHTED WORK:
${dmcaData.copyrightWorkDescription}

COPYRIGHT OWNER INFORMATION:
Name: ${dmcaData.copyrightOwnerName}
Email: ${dmcaData.copyrightOwnerEmail}
Address: ${dmcaData.copyrightOwnerAddress}

IDENTIFICATION OF INFRINGING MATERIAL:
URL: ${dmcaData.infringingUrl}
Description: ${dmcaData.infringingDescription}

STATEMENTS:
I have a good faith belief that use of the copyrighted material described above is not authorized by the copyright owner, its agent, or the law.

I swear, under penalty of perjury, that the information in this notification is accurate and that I am the copyright owner or authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.

ELECTRONIC SIGNATURE:
${dmcaData.copyrightOwnerName}

Please remove or disable access to the infringing material as soon as possible. I look forward to your prompt attention to this matter.

Sincerely,
${dmcaData.copyrightOwnerName}
${dmcaData.copyrightOwnerEmail}

---
This notice was generated and sent via TSMO Copyright Protection System.`;
}