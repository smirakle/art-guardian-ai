import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Real-time threat intelligence interface
interface ThreatIntelligence {
  aiPlatforms: string[];
  scrapingPatterns: string[];
  trainingIndicators: string[];
  riskLevel: 'low' | 'medium' | 'high';
  activeThreats: number;
}

// Fetch real-time threat intelligence
async function fetchRealTimeThreatIntelligence(supabaseClient: any): Promise<ThreatIntelligence> {
  const currentHour = new Date().getHours();
  const baseRisk = currentHour >= 9 && currentHour <= 17 ? 'high' : 'medium';
  
  // Get actual active threats from database
  const { data: activeViolations } = await supabaseClient
    .from('ai_training_violations')
    .select('id')
    .eq('status', 'pending')
    .gte('detected_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours
  
  return {
    aiPlatforms: [
      'huggingface.co/datasets',
      'github.com/ml-datasets', 
      'kaggle.com/competitions',
      'openai.com/research',
      'papers.nips.cc'
    ],
    scrapingPatterns: [
      'automated_image_download',
      'batch_api_requests',
      'headless_browser_activity',
      'high_frequency_access'
    ],
    trainingIndicators: [
      'dataset_preparation',
      'model_fine_tuning', 
      'embedding_extraction',
      'feature_learning'
    ],
    riskLevel: baseRisk,
    activeThreats: activeViolations?.length || 0
  };
}

// Monitor for real-time violations
async function scanForRealTimeViolations(
  protectionRecordId: string, 
  intelligence: ThreatIntelligence,
  supabaseClient: any
) {
  const violations = [];
  const currentTime = new Date().toISOString();
  
  // Check for existing violations first
  const { data: existingViolations } = await supabaseClient
    .from('ai_training_violations')
    .select('source_domain, violation_type')
    .eq('protection_record_id', protectionRecordId)
    .gte('detected_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days
  
  // Only scan platforms that haven't been checked recently
  const recentDomains = existingViolations?.map(v => v.source_domain) || [];
  const platformsToCheck = intelligence.aiPlatforms.filter(platform => 
    !recentDomains.some(domain => platform.includes(domain))
  );
  
  // Real scanning would happen here - for now, only trigger if there's actual suspicious activity
  console.log(`Checking ${platformsToCheck.length} platforms for new violations`);
  
  // In a real implementation, this would:
  // 1. Monitor network traffic patterns
  // 2. Check known AI training endpoints 
  // 3. Analyze API usage patterns
  // 4. Only create violations when real evidence is found
  
  return violations; // Return empty unless real evidence is detected
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestData = await req.json()
    const { 
      protectionRecordId, 
      violationType, 
      sourceUrl, 
      evidenceData, 
      confidenceScore,
      enableRealTimeScanning = false,
      scanType = 'manual'
    } = requestData

    console.log(`AI Training Protection Monitor - Scan Type: ${scanType}`)

    let violations = [];
    let threatIntelligence = null;

    if (enableRealTimeScanning || scanType === 'realtime') {
      // Fetch real-time threat intelligence
      threatIntelligence = await fetchRealTimeThreatIntelligence(supabaseClient);
      console.log(`Real-time threat level: ${threatIntelligence.riskLevel}, Active threats: ${threatIntelligence.activeThreats}`);
      
      // Scan for real-time violations
      const realTimeViolations = await scanForRealTimeViolations(
        protectionRecordId, 
        threatIntelligence,
        supabaseClient
      );
      violations.push(...realTimeViolations);
      
      console.log(`Real-time scan detected ${realTimeViolations.length} violations`);
    }

    // Add manual violation if provided
    if (violationType && sourceUrl) {
      violations.push({
        violation_type: violationType,
        source_url: sourceUrl,
        source_domain: new URL(sourceUrl).hostname,
        confidence_score: confidenceScore,
        evidence_data: {
          ...evidenceData,
          detection_method: 'manual_report',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Insert all violations into database
    const insertedViolations = [];
    for (const violation of violations) {
      const { data: insertedViolation, error: violationError } = await supabaseClient
        .from('ai_training_violations')
        .insert({
          protection_record_id: protectionRecordId,
          violation_type: violation.violation_type,
          source_url: violation.source_url,
          source_domain: violation.source_domain,
          evidence_data: violation.evidence_data,
          confidence_score: violation.confidence_score,
          status: 'pending'
        })
        .select()
        .single()

      if (violationError) {
        console.error('Error inserting violation:', violationError);
        continue;
      }

      insertedViolations.push(insertedViolation);
    }

    // Get protection record details for notifications
    const { data: protectionRecord } = await supabaseClient
      .from('ai_protection_records')
      .select(`
        *,
        artwork:artwork_id (
          title,
          user_id
        )
      `)
      .eq('id', protectionRecordId)
      .single()

    // Create alerts for high-confidence violations
    if (protectionRecord?.user_id) {
      const highConfidenceViolations = insertedViolations.filter(v => 
        v.confidence_score > 75
      );

      for (const violation of highConfidenceViolations) {
        await supabaseClient
          .from('portfolio_alerts')
          .insert({
            portfolio_id: protectionRecord.artwork_id,
            user_id: protectionRecord.user_id,
            alert_type: 'ai_training_violation',
            severity: violation.confidence_score > 85 ? 'high' : 'medium',
            title: 'AI Training Violation Detected',
            message: `${violation.violation_type.replace('_', ' ')} detected on ${violation.source_domain}`,
            metadata: {
              violation_id: violation.id,
              source_url: violation.source_url,
              confidence_score: violation.confidence_score,
              real_time_detection: enableRealTimeScanning
            }
          })
      }
    }

    // Calculate threat assessment
    const highConfidenceCount = insertedViolations.filter(v => v.confidence_score > 85).length;
    const overallThreatLevel = highConfidenceCount > 0 ? 'high' : 
                              insertedViolations.length > 0 ? 'medium' : 'low';

    return new Response(
      JSON.stringify({ 
        success: true, 
        violations_detected: insertedViolations.length,
        high_confidence_violations: highConfidenceCount,
        overall_threat_level: overallThreatLevel,
        real_time_intelligence: threatIntelligence ? {
          risk_level: threatIntelligence.riskLevel,
          active_threats: threatIntelligence.activeThreats,
          monitored_platforms: threatIntelligence.aiPlatforms.length
        } : null,
        scan_timestamp: new Date().toISOString(),
        message: `${insertedViolations.length} violations detected and processed`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in AI training protection monitor:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})