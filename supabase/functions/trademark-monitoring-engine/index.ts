import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrademarkMonitoringRequest {
  action: 'scan_trademark' | 'get_alerts' | 'update_status' | 'analyze_similarity';
  trademark_id?: string;
  scan_type?: 'standard' | 'comprehensive' | 'priority';
  platforms?: string[];
  search_terms?: string[];
  user_id?: string;
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

    const { action, trademark_id, scan_type = 'standard', platforms = [], search_terms = [], user_id } = await req.json() as TrademarkMonitoringRequest;

    console.log(`Trademark monitoring action: ${action}`);

    switch (action) {
      case 'scan_trademark':
        return await handleTrademarkScan(supabase, trademark_id!, scan_type, platforms, search_terms);
      
      case 'get_alerts':
        return await getTrademarkAlerts(supabase, user_id!);
      
      case 'update_status':
        return await updateTrademarkStatus(supabase, trademark_id!);
      
      case 'analyze_similarity':
        return await analyzeSimilarity(supabase, trademark_id!);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Error in trademark monitoring engine:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function handleTrademarkScan(
  supabase: any, 
  trademark_id: string, 
  scan_type: string, 
  platforms: string[], 
  search_terms: string[]
) {
  console.log(`Starting ${scan_type} scan for trademark ${trademark_id}`);

  // Get trademark details
  const { data: trademark, error: trademarkError } = await supabase
    .from('trademarks')
    .select('*')
    .eq('id', trademark_id)
    .single();

  if (trademarkError || !trademark) {
    throw new Error(`Trademark not found: ${trademarkError?.message}`);
  }

  // Create scan record
  const { data: scanRecord, error: scanError } = await supabase
    .from('trademark_monitoring_scans')
    .insert({
      trademark_id,
      user_id: trademark.user_id,
      scan_type,
      scan_status: 'running',
      platforms_scanned: platforms.length > 0 ? platforms : ['uspto', 'euipo', 'wipo', 'google', 'amazon'],
      search_terms_used: search_terms.length > 0 ? search_terms : [trademark.trademark_name],
      scan_parameters: {
        comprehensive: scan_type === 'comprehensive',
        priority: scan_type === 'priority',
        geographic_scope: trademark.jurisdiction ? [trademark.jurisdiction] : ['US', 'EU']
      }
    })
    .select()
    .single();

  if (scanError) {
    throw new Error(`Failed to create scan record: ${scanError.message}`);
  }

  // Simulate trademark monitoring scan
  const results = await performTrademarkScan(trademark, scan_type, platforms);

  // Update scan completion
  await supabase
    .from('trademark_monitoring_scans')
    .update({
      scan_status: 'completed',
      completed_at: new Date().toISOString(),
      scan_duration_seconds: Math.floor(Math.random() * 180) + 30,
      total_results_found: results.length,
      potential_infringements: results.filter(r => r.risk_level === 'high').length,
      high_risk_matches: results.filter(r => r.risk_level === 'high').length,
      medium_risk_matches: results.filter(r => r.risk_level === 'medium').length,
      low_risk_matches: results.filter(r => r.risk_level === 'low').length
    })
    .eq('id', scanRecord.id);

  // Insert search results
  if (results.length > 0) {
    await supabase
      .from('trademark_search_results')
      .insert(results.map(result => ({
        ...result,
        scan_id: scanRecord.id,
        trademark_id,
        user_id: trademark.user_id
      })));

    // Create alerts for high-risk matches
    const highRiskResults = results.filter(r => r.risk_level === 'high');
    if (highRiskResults.length > 0) {
      await createTrademarkAlerts(supabase, trademark, highRiskResults);
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      scan_id: scanRecord.id,
      results_found: results.length,
      high_risk_matches: results.filter(r => r.risk_level === 'high').length,
      scan_duration: scanRecord.scan_duration_seconds,
      timestamp: new Date().toISOString()
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function performTrademarkScan(trademark: any, scan_type: string, platforms: string[]) {
  // Simulate realistic trademark monitoring results
  const mockResults = [];
  const trademarkName = trademark.trademark_name.toLowerCase();
  
  // USPTO simulation
  if (platforms.includes('uspto') || platforms.length === 0) {
    mockResults.push({
      result_type: 'trademark_application',
      match_type: 'exact_match',
      confidence_score: 0.95,
      risk_level: 'high',
      source_platform: 'USPTO',
      source_url: `https://tsdr.uspto.gov/documentviewer?caseId=${Math.random().toString(36).substr(2, 8)}`,
      source_title: `${trademark.trademark_name} - Trademark Application`,
      trademark_text: trademark.trademark_name,
      applicant_name: 'Competitor Corp',
      application_number: `90/${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
      filing_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Published for Opposition',
      trademark_class: trademark.trademark_class || ['035'],
      goods_services: 'Similar goods and services',
      geographic_scope: 'United States',
      similarity_analysis: {
        visual_similarity: 0.85,
        phonetic_similarity: 0.90,
        conceptual_similarity: 0.80
      },
      legal_analysis: {
        likelihood_of_confusion: 'high',
        prior_rights: 'existing_mark_senior',
        recommended_opposition: true
      },
      recommended_actions: ['file_opposition', 'contact_attorney', 'monitor_closely']
    });
  }

  // Domain/Web monitoring
  if (scan_type === 'comprehensive') {
    mockResults.push({
      result_type: 'domain_registration',
      match_type: 'similar_domain',
      confidence_score: 0.75,
      risk_level: 'medium',
      source_platform: 'Domain Registry',
      source_url: `https://www.${trademarkName.replace(/\s+/g, '')}.com`,
      source_title: `${trademarkName.replace(/\s+/g, '')}.com - Domain Registration`,
      trademark_text: trademarkName.replace(/\s+/g, ''),
      applicant_name: 'Unknown Registrant',
      filing_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Active',
      geographic_scope: 'Global',
      similarity_analysis: {
        text_similarity: 0.80,
        domain_variation: 'exact_match_different_tld'
      },
      recommended_actions: ['domain_monitoring', 'check_usage', 'consider_action']
    });

    // Social media monitoring
    mockResults.push({
      result_type: 'social_media_account',
      match_type: 'username_match',
      confidence_score: 0.70,
      risk_level: 'medium',
      source_platform: 'Instagram',
      source_url: `https://instagram.com/${trademarkName.replace(/\s+/g, '_')}`,
      source_title: `@${trademarkName.replace(/\s+/g, '_')} Instagram Account`,
      trademark_text: trademarkName.replace(/\s+/g, '_'),
      status: 'Active',
      geographic_scope: 'Global',
      similarity_analysis: {
        username_similarity: 0.95,
        content_relevance: 'related_industry'
      },
      recommended_actions: ['social_monitoring', 'evaluate_usage', 'consider_report']
    });
  }

  // E-commerce platform monitoring
  if (platforms.includes('amazon') || scan_type === 'comprehensive') {
    mockResults.push({
      result_type: 'product_listing',
      match_type: 'brand_name_usage',
      confidence_score: 0.80,
      risk_level: 'high',
      source_platform: 'Amazon',
      source_url: `https://amazon.com/dp/${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
      source_title: `${trademark.trademark_name} - Product Listing`,
      trademark_text: trademark.trademark_name,
      status: 'Active Listing',
      geographic_scope: 'United States',
      similarity_analysis: {
        brand_name_match: 0.95,
        product_category_overlap: true
      },
      legal_analysis: {
        trademark_infringement_risk: 'high',
        counterfeit_indicators: ['unauthorized_use', 'similar_packaging']
      },
      recommended_actions: ['file_takedown', 'brand_registry_complaint', 'legal_action']
    });
  }

  return mockResults;
}

async function createTrademarkAlerts(supabase: any, trademark: any, highRiskResults: any[]) {
  const alerts = highRiskResults.map(result => ({
    trademark_id: trademark.id,
    user_id: trademark.user_id,
    alert_type: 'high_risk_match',
    severity: 'high',
    title: `High-Risk Trademark Match Detected`,
    description: `A high-confidence match for "${trademark.trademark_name}" was found on ${result.source_platform}`,
    source_url: result.source_url,
    source_domain: result.source_platform.toLowerCase(),
    confidence_score: result.confidence_score,
    evidence_data: {
      match_details: result,
      similarity_analysis: result.similarity_analysis,
      legal_analysis: result.legal_analysis
    }
  }));

  await supabase
    .from('trademark_alerts')
    .insert(alerts);
}

async function getTrademarkAlerts(supabase: any, user_id: string) {
  const { data: alerts, error } = await supabase
    .from('trademark_alerts')
    .select(`
      *,
      trademarks (
        trademark_name,
        jurisdiction
      )
    `)
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Failed to fetch alerts: ${error.message}`);
  }

  return new Response(
    JSON.stringify({
      success: true,
      alerts,
      count: alerts.length,
      timestamp: new Date().toISOString()
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updateTrademarkStatus(supabase: any, trademark_id: string) {
  const { data, error } = await supabase
    .from('trademarks')
    .update({ 
      last_monitored_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', trademark_id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update trademark: ${error.message}`);
  }

  return new Response(
    JSON.stringify({
      success: true,
      trademark: data,
      timestamp: new Date().toISOString()
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function analyzeSimilarity(supabase: any, trademark_id: string) {
  // Simulate trademark similarity analysis
  const analysis = {
    similarity_score: Math.random() * 0.4 + 0.6, // 0.6 to 1.0
    visual_similarity: Math.random() * 0.3 + 0.7,
    phonetic_similarity: Math.random() * 0.2 + 0.8,
    conceptual_similarity: Math.random() * 0.5 + 0.5,
    risk_assessment: 'medium',
    recommendation: 'monitor_closely'
  };

  if (analysis.similarity_score > 0.85) {
    analysis.risk_assessment = 'high';
    analysis.recommendation = 'immediate_action_required';
  } else if (analysis.similarity_score < 0.7) {
    analysis.risk_assessment = 'low';
    analysis.recommendation = 'periodic_monitoring';
  }

  return new Response(
    JSON.stringify({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}