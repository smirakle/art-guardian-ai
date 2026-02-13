import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-gov-api-key',
}

interface ApiKeyValidation {
  valid: boolean;
  agency_id?: string;
  agency_name?: string;
  agency_code?: string;
  security_clearance?: string;
  permissions?: string[];
  classification?: string;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const govApiKey = req.headers.get('x-gov-api-key')
    if (!govApiKey) {
      return new Response(
        JSON.stringify({ error: 'Government API key required' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse request
    const url = new URL(req.url)
    const endpoint = url.pathname.replace('/functions/v1/government-api-gateway', '')
    const method = req.method
    
    console.log(`Government API Gateway: ${method} ${endpoint} from ${govApiKey.substring(0, 10)}...`)

    // Validate API key and get permissions
    const { data: validation, error: validationError } = await supabase
      .rpc('validate_government_api_key', { 
        api_key_param: govApiKey,
        required_permission: getRequiredPermission(endpoint)
      })

    if (validationError) {
      console.error('API key validation error:', validationError)
      return new Response(
        JSON.stringify({ error: 'API key validation failed' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const keyValidation = validation as ApiKeyValidation
    if (!keyValidation.valid) {
      console.log('Invalid API key:', keyValidation.error)
      return new Response(
        JSON.stringify({ error: keyValidation.error || 'Invalid API key' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Log API usage
    const startTime = Date.now()
    let response: Response
    let responseBody: any

    try {
      // Route to appropriate service based on endpoint
      if (endpoint.startsWith('/threat-intelligence')) {
        response = await handleThreatIntelligence(req, keyValidation, supabase)
      } else if (endpoint.startsWith('/monitoring')) {
        response = await handleMonitoring(req, keyValidation, supabase)
      } else if (endpoint.startsWith('/compliance')) {
        response = await handleCompliance(req, keyValidation, supabase)
      } else if (endpoint.startsWith('/ai-protection')) {
        response = await handleAiProtection(req, keyValidation, supabase)
      } else {
        response = new Response(
          JSON.stringify({ error: 'Endpoint not found' }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      responseBody = await response.clone().json().catch(() => ({}))
    } catch (error) {
      console.error('Endpoint error:', error)
      response = new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
      responseBody = { error: 'Internal server error' }
    }

    const responseTime = Date.now() - startTime

    // Log government API usage
    await supabase.from('government_api_usage').insert({
      api_key_id: await getApiKeyId(govApiKey, supabase),
      agency_id: keyValidation.agency_id,
      endpoint,
      method,
      status_code: response.status,
      response_time_ms: responseTime,
      classification_level: keyValidation.classification,
      operation_type: getOperationType(endpoint),
      metadata: {
        agency_code: keyValidation.agency_code,
        permissions_used: getRequiredPermission(endpoint),
        response_size: JSON.stringify(responseBody).length
      }
    })

    console.log(`Government API completed: ${response.status} in ${responseTime}ms`)
    return response

  } catch (error) {
    console.error('Government API Gateway error:', error)
    return new Response(
      JSON.stringify({ error: 'Gateway error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function handleThreatIntelligence(req: Request, validation: ApiKeyValidation, supabase: any) {
  if (!validation.permissions?.includes('threat_intel')) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions for threat intelligence' }),
      { 
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  const url = new URL(req.url)
  const query = url.searchParams.get('query')
  const type = url.searchParams.get('type') || 'all'

  // Simulate threat intelligence data
  const threatData = {
    query,
    timestamp: new Date().toISOString(),
    classification: validation.classification,
    agency: validation.agency_code,
    threats: [
      {
        id: 'threat-001',
        type: 'malware',
        severity: 'high',
        indicators: ['suspicious-domain.com', '192.168.1.100'],
        description: 'Advanced persistent threat detected',
        first_seen: '2024-01-15T10:30:00Z',
        confidence: 0.95
      },
      {
        id: 'threat-002',
        type: 'phishing',
        severity: 'medium',
        indicators: ['fake-login-page.net'],
        description: 'Credential harvesting campaign',
        first_seen: '2024-01-14T15:45:00Z',
        confidence: 0.87
      }
    ],
    metadata: {
      total_threats: 2,
      query_time_ms: 45,
      sources: ['internal_feeds', 'partner_intelligence', 'osint']
    }
  }

  return new Response(
    JSON.stringify(threatData),
    { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function handleMonitoring(req: Request, validation: ApiKeyValidation, supabase: any) {
  if (!validation.permissions?.includes('monitoring')) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions for monitoring' }),
      { 
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  const url = new URL(req.url)
  const domain = url.searchParams.get('domain')
  const scan_type = url.searchParams.get('scan_type') || 'comprehensive'

  // Simulate monitoring scan results
  const monitoringData = {
    scan_id: `scan-${Date.now()}`,
    domain,
    scan_type,
    timestamp: new Date().toISOString(),
    classification: validation.classification,
    agency: validation.agency_code,
    results: {
      security_score: 85,
      vulnerabilities: [
        {
          type: 'ssl_certificate',
          severity: 'medium',
          description: 'SSL certificate expires in 30 days'
        }
      ],
      compliance_status: {
        gdpr: 'compliant',
        ccpa: 'compliant',
        government_standards: 'review_required'
      },
      threat_indicators: [
        {
          indicator: 'suspicious_traffic_pattern',
          confidence: 0.72,
          description: 'Unusual traffic spike detected'
        }
      ]
    },
    metadata: {
      scan_duration_ms: 1250,
      total_checks: 15,
      passed_checks: 12
    }
  }

  return new Response(
    JSON.stringify(monitoringData),
    { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function handleCompliance(req: Request, validation: ApiKeyValidation, supabase: any) {
  if (!validation.permissions?.includes('compliance')) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions for compliance' }),
      { 
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  const url = new URL(req.url)
  const framework = url.searchParams.get('framework') || 'nist'
  const entity = url.searchParams.get('entity')

  // Simulate compliance check results
  const complianceData = {
    check_id: `compliance-${Date.now()}`,
    framework,
    entity,
    timestamp: new Date().toISOString(),
    classification: validation.classification,
    agency: validation.agency_code,
    compliance_status: {
      overall_score: 88,
      framework_version: framework === 'nist' ? '2.0' : '1.0',
      controls: [
        {
          control_id: 'AC-1',
          name: 'Access Control Policy',
          status: 'compliant',
          score: 95
        },
        {
          control_id: 'SC-7',
          name: 'Boundary Protection',
          status: 'partially_compliant',
          score: 75,
          issues: ['Firewall rules need review']
        }
      ],
      recommendations: [
        'Review firewall configuration',
        'Update access control documentation',
        'Implement continuous monitoring'
      ]
    },
    metadata: {
      assessment_duration_ms: 2100,
      total_controls: 18,
      compliant_controls: 15
    }
  }

  return new Response(
    JSON.stringify(complianceData),
    { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function handleAiProtection(req: Request, validation: ApiKeyValidation, supabase: any) {
  if (!validation.permissions?.includes('ai_protection')) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions for AI protection' }),
      { 
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  if (req.method === 'POST') {
    const requestBody = await req.json()
    const { file_url, analysis_type = 'comprehensive' } = requestBody

    // Simulate AI protection analysis
    const aiProtectionData = {
      analysis_id: `ai-analysis-${Date.now()}`,
      file_url,
      analysis_type,
      timestamp: new Date().toISOString(),
      classification: validation.classification,
      agency: validation.agency_code,
      results: {
        ai_training_risk: 0.15,
        deepfake_probability: 0.03,
        copyright_violations: [],
        model_fingerprints: [
          {
            model_name: 'unknown_gan_v1',
            confidence: 0.89,
            signatures: ['generator_artifacts', 'interpolation_patterns']
          }
        ],
        protection_recommendations: [
          'Add digital watermark',
          'Enable content tracking',
          'Implement usage monitoring'
        ]
      },
      metadata: {
        analysis_duration_ms: 3400,
        file_size_bytes: 1048576,
        models_checked: 12
      }
    }

    return new Response(
      JSON.stringify(aiProtectionData),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed for AI protection' }),
    { 
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

function getRequiredPermission(endpoint: string): string | null {
  if (endpoint.startsWith('/threat-intelligence')) return 'threat_intel'
  if (endpoint.startsWith('/monitoring')) return 'monitoring'
  if (endpoint.startsWith('/compliance')) return 'compliance'
  if (endpoint.startsWith('/ai-protection')) return 'ai_protection'
  return null
}

function getOperationType(endpoint: string): string {
  if (endpoint.startsWith('/threat-intelligence')) return 'threat_analysis'
  if (endpoint.startsWith('/monitoring')) return 'monitoring_scan'
  if (endpoint.startsWith('/compliance')) return 'compliance_check'
  if (endpoint.startsWith('/ai-protection')) return 'ai_analysis'
  return 'unknown'
}

async function getApiKeyId(apiKey: string, supabase: any): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('government_api_keys')
      .select('id')
      .eq('api_key', apiKey)
      .single()

    if (error) return null
    return data?.id || null
  } catch {
    return null
  }
}