import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InsuranceProduct {
  id: string;
  name: string;
  provider: string;
  coverage: string;
  premium: number;
  features: string[];
  eligibility: string[];
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

    const { action, productId } = await req.json();

    switch (action) {
      case 'getProducts':
        return handleGetProducts();
      case 'initiatePurchase':
        return handleInitiatePurchase(productId, user.id, supabase);
      case 'initiateClaim':
        return handleInitiateClaim(productId, user.id, supabase);
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Insurance partnership error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function handleGetProducts() {
  // In a real implementation, this would fetch from insurance partner APIs
  const products: InsuranceProduct[] = [
    {
      id: '1',
      name: 'IP Shield Pro',
      provider: 'CyberGuard Insurance',
      coverage: 'Up to $1M for IP theft and unauthorized use',
      premium: 299,
      features: [
        'Global coverage across 50+ countries',
        'Legal fee protection up to $500K',
        'Emergency takedown services',
        '24/7 incident response team',
        'AI-powered threat monitoring'
      ],
      eligibility: ['Active content creators', 'Verified IP ownership', 'No prior claims']
    },
    {
      id: '2',
      name: 'Creator Defense',
      provider: 'Digital Rights Insurance',
      coverage: 'Up to $500K for content theft and deepfakes',
      premium: 149,
      features: [
        'Deepfake protection coverage',
        'Social media monitoring',
        'DMCA enforcement support',
        'Identity theft protection',
        'Revenue loss compensation'
      ],
      eligibility: ['Social media presence', 'Regular content creation', 'Good credit score']
    }
  ];

  return new Response(
    JSON.stringify({ products }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleInitiatePurchase(productId: string, userId: string, supabase: any) {
  console.log(`Initiating purchase for product ${productId} for user ${userId}`);

  // Log the purchase initiation
  const { error: logError } = await supabase
    .from('enterprise_ai_analyses')
    .insert({
      user_id: userId,
      image_url: 'insurance_purchase',
      analysis_type: 'insurance_purchase',
      analyses: [{
        action: 'purchase_initiated',
        product_id: productId,
        timestamp: new Date().toISOString()
      }],
      risk_factors: [],
      overall_risk: 'low'
    });

  if (logError) {
    console.error('Failed to log purchase:', logError);
  }

  // In a real implementation, this would:
  // 1. Validate user eligibility
  // 2. Generate secure application link with insurance partner
  // 3. Handle partner API integration
  // 4. Manage callback for application status

  const applicationData = {
    applicationId: `app_${Date.now()}_${userId.slice(0, 8)}`,
    productId,
    userId,
    status: 'initiated',
    redirectUrl: `https://insurance-partner.com/apply?product=${productId}&ref=${userId}`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
  };

  return new Response(
    JSON.stringify({
      success: true,
      applicationId: applicationData.applicationId,
      redirectUrl: applicationData.redirectUrl,
      message: 'Insurance application initiated successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleInitiateClaim(productId: string, userId: string, supabase: any) {
  console.log(`Initiating claim for product ${productId} for user ${userId}`);

  // In a real implementation, this would:
  // 1. Validate active insurance policy
  // 2. Check claim eligibility and remaining claims
  // 3. Generate claim form with pre-filled user data
  // 4. Submit to insurance partner API
  // 5. Track claim status

  const claimData = {
    claimId: `claim_${Date.now()}_${userId.slice(0, 8)}`,
    productId,
    userId,
    status: 'submitted',
    submittedAt: new Date().toISOString(),
    estimatedProcessingTime: '5-7 business days'
  };

  // Log the claim initiation
  const { error: logError } = await supabase
    .from('enterprise_ai_analyses')
    .insert({
      user_id: userId,
      image_url: 'insurance_claim',
      analysis_type: 'insurance_claim',
      analyses: [{
        action: 'claim_initiated',
        product_id: productId,
        claim_id: claimData.claimId,
        timestamp: new Date().toISOString()
      }],
      risk_factors: [],
      overall_risk: 'low'
    });

  if (logError) {
    console.error('Failed to log claim:', logError);
  }

  return new Response(
    JSON.stringify({
      success: true,
      claimId: claimData.claimId,
      status: claimData.status,
      estimatedProcessingTime: claimData.estimatedProcessingTime,
      message: 'Insurance claim submitted successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}