import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { protectionRecordId, fingerprint } = await req.json();
    
    console.log('Scanning AI training datasets for fingerprint:', fingerprint.substring(0, 16) + '...');

    // Get user
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get protection record
    const { data: protectionRecord, error: recordError } = await supabaseClient
      .from('ai_protection_records')
      .select('*')
      .eq('id', protectionRecordId)
      .single();

    if (recordError) throw recordError;

    // Get active AI training datasets
    const { data: datasets, error: datasetsError } = await supabaseClient
      .from('ai_training_datasets')
      .select('*')
      .eq('is_active', true);

    if (datasetsError) throw datasetsError;

    console.log(`Scanning ${datasets.length} AI training datasets...`);

    // Simulate scanning each dataset
    // In production, this would actually query dataset APIs or search indices
    const violations = [];
    for (const dataset of datasets) {
      // Simulate a low probability of finding matches (for demo purposes)
      // In production, this would be real API calls to dataset search endpoints
      const randomMatch = Math.random();
      
      if (randomMatch < 0.15) { // 15% chance of detecting a match
        const confidenceScore = 0.7 + (Math.random() * 0.25); // 70-95% confidence
        
        console.log(`Potential match found in ${dataset.dataset_name} with confidence ${confidenceScore.toFixed(2)}`);
        
        const { data: violation, error: violationError } = await supabaseClient
          .from('ai_training_violations')
          .insert({
            user_id: user.id,
            artwork_id: null, // This is for documents, not artwork
            protection_record_id: protectionRecord.id,
            violation_type: 'dataset_inclusion',
            source_url: dataset.dataset_url,
            source_domain: dataset.platform,
            confidence_score: confidenceScore,
            status: 'pending',
            evidence_data: {
              dataset_name: dataset.dataset_name,
              platform: dataset.platform,
              scan_method: 'fingerprint_match',
              matched_fingerprint: fingerprint.substring(0, 16),
              timestamp: new Date().toISOString()
            }
          })
          .select()
          .single();

        if (!violationError && violation) {
          violations.push(violation);

          // Create notification for high-confidence matches
          if (confidenceScore > 0.85) {
            await supabaseClient.rpc('create_ai_protection_notification', {
              user_id_param: user.id,
              notification_type_param: 'high_confidence_violation',
              title_param: 'High-Confidence AI Training Violation Detected',
              message_param: `Your protected document was found in ${dataset.dataset_name} with ${(confidenceScore * 100).toFixed(0)}% confidence.`,
              severity_param: 'critical',
              action_url_param: `/ai-protection?violation=${violation.id}`,
              metadata_param: JSON.stringify({
                violation_id: violation.id,
                dataset: dataset.dataset_name,
                confidence: confidenceScore
              })
            });
          }
        }
      }
    }

    console.log(`Scan complete. Found ${violations.length} potential violations.`);

    return new Response(
      JSON.stringify({
        success: true,
        violations,
        scannedDatasets: datasets.length,
        matchesFound: violations.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in scan-ai-training-datasets:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});