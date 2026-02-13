import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
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
    const { userId, filingType, action = 'check' } = await req.json();
    
    if (!userId || !filingType) {
      return new Response(JSON.stringify({
        error: 'Missing required parameters: userId, filingType'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await checkRateLimit(userId, filingType, action);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in filing-rate-limiter:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function checkRateLimit(userId: string, filingType: string, action: string) {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  // Define rate limits based on filing type
  const limits = {
    dmca_filing: { 
      perHour: 5, 
      perDay: 20,
      description: 'DMCA notices'
    },
    government_filing: { 
      perHour: 2, 
      perDay: 10,
      description: 'Government filings'
    },
    default: { 
      perHour: 3, 
      perDay: 15,
      description: 'General filings'
    }
  };

  const limit = limits[filingType] || limits.default;

  try {
    // Check DMCA notices for the past hour and day
    let hourlyCount = 0;
    let dailyCount = 0;

    if (filingType === 'dmca_filing') {
      const { data: dmcaHourly, error: dmcaHourlyError } = await supabase
        .from('dmca_notices')
        .select('id')
        .gte('created_at', oneHourAgo.toISOString())
        .eq('copyright_owner_email', userId); // Assuming userId is email for DMCA

      const { data: dmcaDaily, error: dmcaDailyError } = await supabase
        .from('dmca_notices')
        .select('id')
        .gte('created_at', oneDayAgo.toISOString())
        .eq('copyright_owner_email', userId);

      if (!dmcaHourlyError) hourlyCount += dmcaHourly?.length || 0;
      if (!dmcaDailyError) dailyCount += dmcaDaily?.length || 0;
    } else {
      // Check government filings
      const { data: govHourly, error: govHourlyError } = await supabase
        .from('government_filings')
        .select('id')
        .gte('created_at', oneHourAgo.toISOString())
        .eq('user_id', userId);

      const { data: govDaily, error: govDailyError } = await supabase
        .from('government_filings')
        .select('id')
        .gte('created_at', oneDayAgo.toISOString())
        .eq('user_id', userId);

      if (!govHourlyError) hourlyCount += govHourly?.length || 0;
      if (!govDailyError) dailyCount += govDaily?.length || 0;
    }

    const isAllowed = hourlyCount < limit.perHour && dailyCount < limit.perDay;

    // Log the rate limit check
    await supabase
      .from('filing_rate_limit_log')
      .insert({
        user_id: userId,
        filing_type: filingType,
        action: action,
        hourly_count: hourlyCount,
        daily_count: dailyCount,
        limit_exceeded: !isAllowed,
        ip_address: '0.0.0.0', // Would be req.headers.get('x-forwarded-for') in real app
        user_agent: 'TSMO-Filing-System'
      });

    if (!isAllowed) {
      console.log(`Rate limit exceeded for user ${userId}: ${hourlyCount}/${limit.perHour} hourly, ${dailyCount}/${limit.perDay} daily`);
    }

    return {
      allowed: isAllowed,
      limits: {
        perHour: limit.perHour,
        perDay: limit.perDay,
        description: limit.description
      },
      usage: {
        hourly: hourlyCount,
        daily: dailyCount
      },
      nextAllowedAt: isAllowed ? null : new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
      message: isAllowed 
        ? `Filing allowed. ${limit.perHour - hourlyCount} remaining this hour.`
        : `Rate limit exceeded. You have sent ${hourlyCount} ${limit.description} in the past hour (limit: ${limit.perHour}).`
    };

  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Allow the operation if rate limiting fails (fail open)
    return {
      allowed: true,
      error: 'Rate limiting temporarily unavailable',
      limits: limit,
      usage: { hourly: 0, daily: 0 }
    };
  }
}