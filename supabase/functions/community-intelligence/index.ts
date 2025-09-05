import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ThreatReport {
  id: string;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reportedBy: string;
  verifiedBy: number;
  status: 'pending' | 'verified' | 'dismissed';
  location: string;
  evidence: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { action, threatId, isValid } = await req.json();

    switch (action) {
      case 'getCommunityData':
        return handleGetCommunityData(user.id, supabase);
      case 'verifyThreat':
        return handleVerifyThreat(threatId, isValid, user.id, supabase);
      case 'reportThreat':
        return handleReportThreat(await req.json(), user.id, supabase);
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Community intelligence error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function handleGetCommunityData(userId: string, supabase: any) {
  // In a real implementation, this would fetch from community intelligence tables
  // For now, we'll return mock data and log the request
  
  const { error: logError } = await supabase
    .from('ai_protection_audit_log')
    .insert({
      user_id: userId,
      action: 'view_community_intelligence',
      resource_type: 'community_data',
      details: { timestamp: new Date().toISOString() }
    });

  if (logError) {
    console.error('Failed to log community data access:', logError);
  }

  // Mock community data
  const mockData = {
    threats: [
      {
        id: '1',
        type: 'Deepfake Detection',
        description: 'Suspicious video content on social media platform',
        severity: 'high',
        reportedBy: 'CommunityWatcher#1234',
        verifiedBy: 12,
        status: 'verified',
        createdAt: '2024-01-15T10:30:00Z',
        location: 'Instagram',
        evidence: ['video_analysis.json', 'metadata_report.pdf']
      },
      {
        id: '2',
        type: 'AI-Generated Art',
        description: 'Unauthorized AI-generated artwork using protected style',
        severity: 'medium',
        reportedBy: 'ArtDefender#5678',
        verifiedBy: 8,
        status: 'pending',
        createdAt: '2024-01-14T15:45:00Z',
        location: 'DeviantArt',
        evidence: ['style_comparison.jpg', 'source_analysis.txt']
      }
    ],
    members: [
      {
        id: '1',
        username: 'CommunityWatcher#1234',
        reputation: 1250,
        reportsSubmitted: 45,
        reportsVerified: 38,
        level: 'Expert Sentinel',
        badges: ['Top Contributor', 'Accuracy Master', 'Speed Demon']
      },
      {
        id: '2',
        username: 'VoiceGuard#9999',
        reputation: 2100,
        reportsSubmitted: 67,
        reportsVerified: 59,
        level: 'Elite Guardian',
        badges: ['Voice Specialist', 'Community Leader', 'Threat Hunter']
      }
    ],
    statistics: {
      totalThreats: 1247,
      activeMembers: 856,
      accuracyRate: 98.5,
      threatsResolvedToday: 23
    }
  };

  return new Response(
    JSON.stringify(mockData),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleVerifyThreat(threatId: string, isValid: boolean, userId: string, supabase: any) {
  console.log(`User ${userId} verifying threat ${threatId} as ${isValid ? 'valid' : 'invalid'}`);

  // Log the verification action
  const { error: logError } = await supabase
    .from('ai_protection_audit_log')
    .insert({
      user_id: userId,
      action: 'verify_threat',
      resource_type: 'community_threat',
      resource_id: threatId,
      details: { 
        verification: isValid ? 'valid' : 'invalid',
        timestamp: new Date().toISOString()
      }
    });

  if (logError) {
    console.error('Failed to log threat verification:', logError);
  }

  // In a real implementation, this would:
  // 1. Update the threat record with the verification
  // 2. Update user reputation based on accuracy
  // 3. Check if threat reaches verification threshold
  // 4. Trigger actions if threat is confirmed

  const reputationGain = 10;
  const verificationResult = {
    threatId,
    verification: isValid ? 'valid' : 'invalid',
    reputationGained: reputationGain,
    newTotalVerifications: Math.floor(Math.random() * 20) + 1,
    message: `Threat ${isValid ? 'verified as valid' : 'dismissed'}. You earned ${reputationGain} reputation points!`
  };

  return new Response(
    JSON.stringify({
      success: true,
      ...verificationResult
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleReportThreat(reportData: any, userId: string, supabase: any) {
  console.log(`User ${userId} reporting new threat:`, reportData);

  // Log the threat report
  const { error: logError } = await supabase
    .from('ai_protection_audit_log')
    .insert({
      user_id: userId,
      action: 'report_threat',
      resource_type: 'community_threat',
      details: { 
        threat_type: reportData.type,
        severity: reportData.severity,
        timestamp: new Date().toISOString()
      }
    });

  if (logError) {
    console.error('Failed to log threat report:', logError);
  }

  // In a real implementation, this would:
  // 1. Validate the threat report
  // 2. Store in community threats table
  // 3. Initiate verification process
  // 4. Award reputation points to reporter
  // 5. Trigger notifications to relevant community members

  const threatId = `threat_${Date.now()}_${userId.slice(0, 8)}`;
  const reputationGain = 50; // Base points for submitting a report

  return new Response(
    JSON.stringify({
      success: true,
      threatId,
      status: 'pending_verification',
      reputationGained: reputationGain,
      message: 'Threat reported successfully and submitted for community verification'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}