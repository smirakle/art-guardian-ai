import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidateEmailRequest {
  emails: string[];
}

interface ValidationResult {
  email: string;
  isValid: boolean;
  status: 'valid' | 'invalid' | 'risky' | 'unknown';
  reason?: string;
  details: {
    syntaxValid: boolean;
    domainExists: boolean;
    mxRecordExists: boolean;
    isDisposable: boolean;
    isRoleAccount: boolean;
    riskScore: number;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader!,
          },
        },
      }
    );

    // Get current user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { emails }: ValidateEmailRequest = await req.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return new Response(JSON.stringify({ error: 'Valid email array is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const results: ValidationResult[] = [];

    for (const email of emails) {
      const validationResult = await validateEmail(email);
      results.push(validationResult);

      // Store validation result in database
      await supabaseClient
        .from('email_validations')
        .upsert({
          user_id: user.id,
          email_address: email.toLowerCase(),
          validation_status: validationResult.status,
          validation_details: validationResult.details,
          validated_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        }, {
          onConflict: 'user_id,email_address'
        });
    }

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in email-validation:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

async function validateEmail(email: string): Promise<ValidationResult> {
  const result: ValidationResult = {
    email,
    isValid: false,
    status: 'unknown',
    details: {
      syntaxValid: false,
      domainExists: false,
      mxRecordExists: false,
      isDisposable: false,
      isRoleAccount: false,
      riskScore: 0
    }
  };

  try {
    // Basic syntax validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    result.details.syntaxValid = emailRegex.test(email);

    if (!result.details.syntaxValid) {
      result.status = 'invalid';
      result.reason = 'Invalid email syntax';
      return result;
    }

    const [localPart, domain] = email.split('@');

    // Check for role accounts
    const roleAccounts = ['admin', 'administrator', 'support', 'help', 'info', 'sales', 'marketing', 'no-reply', 'noreply'];
    result.details.isRoleAccount = roleAccounts.includes(localPart.toLowerCase());

    // Check for disposable email providers
    const disposableDomains = [
      '10minutemail.com', 'temp-mail.org', 'guerrillamail.com', 'mailinator.com',
      'yopmail.com', 'throwaway.email', 'tempmail.net', 'getnada.com'
    ];
    result.details.isDisposable = disposableDomains.includes(domain.toLowerCase());

    // DNS validation (simplified)
    try {
      // In a real implementation, you would check DNS records
      // For now, we'll simulate this check
      result.details.domainExists = await checkDomainExists(domain);
      result.details.mxRecordExists = result.details.domainExists; // Simplified
    } catch (error) {
      console.log('DNS check failed:', error);
      result.details.domainExists = false;
      result.details.mxRecordExists = false;
    }

    // Calculate risk score
    let riskScore = 0;
    if (!result.details.syntaxValid) riskScore += 100;
    if (!result.details.domainExists) riskScore += 80;
    if (!result.details.mxRecordExists) riskScore += 60;
    if (result.details.isDisposable) riskScore += 70;
    if (result.details.isRoleAccount) riskScore += 30;

    result.details.riskScore = Math.min(riskScore, 100);

    // Determine final status
    if (riskScore >= 80) {
      result.status = 'invalid';
      result.reason = 'High risk email address';
    } else if (riskScore >= 40) {
      result.status = 'risky';
      result.reason = 'Potentially problematic email address';
    } else if (result.details.syntaxValid && result.details.domainExists) {
      result.status = 'valid';
      result.isValid = true;
    } else {
      result.status = 'unknown';
      result.reason = 'Unable to fully validate email';
    }

  } catch (error) {
    console.error('Email validation error:', error);
    result.status = 'unknown';
    result.reason = 'Validation error occurred';
  }

  return result;
}

async function checkDomainExists(domain: string): Promise<boolean> {
  try {
    // Simplified domain check - in production, you'd use proper DNS resolution
    // For demo purposes, we'll consider most domains as existing
    const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com'];
    if (commonDomains.includes(domain.toLowerCase())) {
      return true;
    }

    // Basic domain format check
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  } catch (error) {
    return false;
  }
}

serve(handler);