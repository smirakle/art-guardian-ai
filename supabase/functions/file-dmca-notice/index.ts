import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DMCARequest {
  matchId: string;
  copyrightOwnerName: string;
  copyrightOwnerEmail: string;
  copyrightOwnerAddress: string;
  copyrightWorkDescription: string;
  infringingUrl: string;
  infringingDescription: string;
  goodFaithStatement: boolean;
  accuracyStatement: boolean;
  electronicSignature: string;
  timestamp: string;
}

// Input validation and sanitization
function validateDMCARequest(data: any): DMCARequest {
  const errors: string[] = [];
  
  // Validate matchId (UUID format)
  if (!data.matchId || typeof data.matchId !== 'string') {
    errors.push('Match ID is required');
  } else {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(data.matchId)) {
      errors.push('Invalid match ID format');
    }
  }
  
  // Validate required string fields
  const stringFields = [
    'copyrightOwnerName', 'copyrightOwnerEmail', 'copyrightOwnerAddress',
    'copyrightWorkDescription', 'infringingUrl', 'infringingDescription',
    'electronicSignature'
  ];
  
  for (const field of stringFields) {
    if (!data[field] || typeof data[field] !== 'string' || data[field].trim().length === 0) {
      errors.push(`${field} is required`);
    } else if (data[field].length > 2000) {
      errors.push(`${field} must be less than 2000 characters`);
    }
  }
  
  // Validate email format
  if (data.copyrightOwnerEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.copyrightOwnerEmail)) {
      errors.push('Valid email address is required');
    }
  }
  
  // Validate URL format
  if (data.infringingUrl) {
    try {
      new URL(data.infringingUrl);
    } catch {
      errors.push('Valid infringing URL is required');
    }
  }
  
  // Validate timestamp
  if (!data.timestamp || typeof data.timestamp !== 'string') {
    errors.push('Timestamp is required');
  } else {
    const timestamp = new Date(data.timestamp);
    if (isNaN(timestamp.getTime())) {
      errors.push('Valid timestamp is required');
    }
  }
  
  // Validate boolean statements
  if (data.goodFaithStatement !== true) {
    errors.push('Good faith statement must be acknowledged');
  }
  
  if (data.accuracyStatement !== true) {
    errors.push('Accuracy statement must be acknowledged');
  }
  
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }
  
  // Sanitize strings
  const sanitize = (str: string) => str.trim().substring(0, 2000);
  
  return {
    matchId: data.matchId,
    copyrightOwnerName: sanitize(data.copyrightOwnerName),
    copyrightOwnerEmail: data.copyrightOwnerEmail.trim().toLowerCase(),
    copyrightOwnerAddress: sanitize(data.copyrightOwnerAddress),
    copyrightWorkDescription: sanitize(data.copyrightWorkDescription),
    infringingUrl: data.infringingUrl.trim(),
    infringingDescription: sanitize(data.infringingDescription),
    electronicSignature: sanitize(data.electronicSignature),
    goodFaithStatement: data.goodFaithStatement,
    accuracyStatement: data.accuracyStatement,
    timestamp: data.timestamp
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse and validate request body
    const rawData = await req.json();
    const dmcaData: DMCARequest = validateDMCARequest(rawData);
    console.log('Processing DMCA notice for match:', dmcaData.matchId);

    // Get match details
    const { data: match, error: matchError } = await supabase
      .from('copyright_matches')
      .select('*, artwork(*)')
      .eq('id', dmcaData.matchId)
      .single();

    if (matchError || !match) {
      throw new Error('Match not found');
    }

    // Extract domain from URL for targeting
    let targetDomain = '';
    try {
      const url = new URL(dmcaData.infringingUrl);
      targetDomain = url.hostname;
    } catch (e) {
      targetDomain = 'unknown';
    }

    // Create DMCA notice record
    const { data: dmcaNotice, error: insertError } = await supabase
      .from('dmca_notices')
      .insert({
        match_id: dmcaData.matchId,
        artwork_id: match.artwork_id,
        copyright_owner_name: dmcaData.copyrightOwnerName,
        copyright_owner_email: dmcaData.copyrightOwnerEmail,
        copyright_owner_address: dmcaData.copyrightOwnerAddress,
        copyright_work_description: dmcaData.copyrightWorkDescription,
        infringing_url: dmcaData.infringingUrl,
        infringing_description: dmcaData.infringingDescription,
        target_domain: targetDomain,
        electronic_signature: dmcaData.electronicSignature,
        status: 'filed',
        filed_at: dmcaData.timestamp
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting DMCA notice:', insertError);
      throw insertError;
    }

    // Generate DMCA notice text
    const dmcaNoticeText = generateDMCANotice(dmcaData, match);
    
    // Simulate sending to appropriate parties
    console.log('DMCA Notice generated and filed:', {
      id: dmcaNotice.id,
      targetDomain,
      timestamp: dmcaData.timestamp
    });

    // In a real implementation, you would:
    // 1. Look up DMCA contact for the domain
    // 2. Send the notice via email
    // 3. Update status tracking
    // 4. Set up follow-up reminders

    // Update match status
    await supabase
      .from('copyright_matches')
      .update({ 
        is_reviewed: true,
        dmca_filed: true,
        dmca_filed_at: dmcaData.timestamp
      })
      .eq('id', dmcaData.matchId);

    // Create alert for successful filing
    await supabase.functions.invoke('create-monitoring-alert', {
      body: {
        matchId: dmcaData.matchId,
        userId: match.artwork.user_id,
        alertType: 'dmca_filed',
        title: 'DMCA Notice Filed',
        message: `DMCA takedown notice has been filed for content found on ${targetDomain}`
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        noticeId: dmcaNotice.id,
        targetDomain,
        message: 'DMCA notice filed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error filing DMCA notice:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to file DMCA notice' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function generateDMCANotice(dmcaData: DMCARequest, match: any): string {
  return `
DMCA TAKEDOWN NOTICE

To: DMCA Agent
From: ${dmcaData.copyrightOwnerName}
Date: ${new Date(dmcaData.timestamp).toLocaleDateString()}

I am writing to notify you of copyright infringement occurring on your website.

COPYRIGHT OWNER INFORMATION:
Name: ${dmcaData.copyrightOwnerName}
Email: ${dmcaData.copyrightOwnerEmail}
Address: ${dmcaData.copyrightOwnerAddress}

COPYRIGHTED WORK:
${dmcaData.copyrightWorkDescription}

INFRINGING MATERIAL:
URL: ${dmcaData.infringingUrl}
Description: ${dmcaData.infringingDescription}

STATEMENTS:
- I have a good faith belief that use of the copyrighted material described above is not authorized by the copyright owner, its agent, or the law.
- I swear, under penalty of perjury, that the information in this notification is accurate and that I am the copyright owner or authorized to act on behalf of the owner.

ELECTRONIC SIGNATURE: ${dmcaData.electronicSignature}

Please remove or disable access to the infringing material immediately.

Generated by TSMO Copyright Protection System
`;
}