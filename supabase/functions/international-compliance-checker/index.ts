import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      userJurisdiction, 
      targetJurisdictions = [], 
      legalMatter, 
      documentType,
      complianceLevel = 'standard'
    } = await req.json();

    if (!userJurisdiction || !legalMatter) {
      return new Response(JSON.stringify({
        error: 'Missing required parameters: userJurisdiction, legalMatter'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Checking international compliance for: ${legalMatter} across jurisdictions`);

    // Determine target jurisdictions if not specified
    const jurisdictionsToCheck = targetJurisdictions.length > 0 ? 
      targetJurisdictions : 
      await getRelevantJurisdictions(userJurisdiction, legalMatter);

    // Perform compliance analysis for each jurisdiction
    const complianceResults = await Promise.all(
      jurisdictionsToCheck.map(jurisdiction => 
        analyzeJurisdictionCompliance(jurisdiction, legalMatter, documentType)
      )
    );

    // Generate comprehensive compliance report
    const complianceReport = await generateComplianceReport(
      userJurisdiction,
      jurisdictionsToCheck,
      complianceResults,
      legalMatter
    );

    // Identify conflicts and harmonization opportunities
    const conflictAnalysis = await analyzeJurisdictionalConflicts(complianceResults);

    // Generate recommendations
    const recommendations = await generateComplianceRecommendations(
      complianceResults,
      conflictAnalysis,
      complianceLevel
    );

    // Store compliance analysis
    const { data: analysis, error: analysisError } = await supabase
      .from('international_compliance_analysis')
      .insert({
        user_jurisdiction: userJurisdiction,
        target_jurisdictions: jurisdictionsToCheck,
        legal_matter: legalMatter,
        document_type: documentType,
        compliance_level: complianceLevel,
        compliance_results: complianceResults,
        conflict_analysis: conflictAnalysis,
        recommendations: recommendations,
        compliance_score: complianceReport.overallScore,
        analysis_metadata: {
          analyzedAt: new Date().toISOString(),
          jurisdictionCount: jurisdictionsToCheck.length,
          highRiskCount: complianceResults.filter(r => r.riskLevel === 'high').length
        }
      })
      .select()
      .single();

    if (analysisError) {
      console.error('Failed to store compliance analysis:', analysisError);
    }

    console.log(`International compliance analysis completed: ${analysis?.id || 'temp'}`);

    return new Response(JSON.stringify({
      success: true,
      analysisId: analysis?.id,
      compliance: {
        overallScore: complianceReport.overallScore,
        riskLevel: complianceReport.riskLevel,
        compliantJurisdictions: complianceResults.filter(r => r.isCompliant).length,
        totalJurisdictions: jurisdictionsToCheck.length
      },
      jurisdictions: complianceResults,
      conflicts: conflictAnalysis,
      recommendations: recommendations,
      actionPlan: complianceReport.actionPlan
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in international-compliance-checker:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getRelevantJurisdictions(userJurisdiction: string, legalMatter: string) {
  const relevantJurisdictions: { [key: string]: string[] } = {
    'US': ['EU', 'UK', 'CA', 'AU', 'JP'],
    'EU': ['US', 'UK', 'CH', 'NO', 'CA'],
    'UK': ['EU', 'US', 'CA', 'AU', 'IN'],
    'CA': ['US', 'EU', 'UK', 'AU', 'MX'],
    'AU': ['US', 'EU', 'UK', 'NZ', 'SG'],
    'JP': ['US', 'EU', 'CN', 'KR', 'SG']
  };

  const baseJurisdictions = relevantJurisdictions[userJurisdiction] || ['US', 'EU', 'UK'];
  
  // Add matter-specific jurisdictions
  if (legalMatter.toLowerCase().includes('copyright')) {
    baseJurisdictions.push('WIPO'); // World Intellectual Property Organization
  }
  
  if (legalMatter.toLowerCase().includes('data') || legalMatter.toLowerCase().includes('privacy')) {
    baseJurisdictions.push('GDPR'); // EU GDPR
  }

  return [...new Set(baseJurisdictions)].slice(0, 8); // Limit to 8 jurisdictions
}

async function analyzeJurisdictionCompliance(
  jurisdiction: string, 
  legalMatter: string, 
  documentType: string
) {
  const prompt = `
Analyze legal compliance for the following matter in ${jurisdiction} jurisdiction:

LEGAL MATTER: ${legalMatter}
DOCUMENT TYPE: ${documentType}
JURISDICTION: ${jurisdiction}

Provide analysis covering:
1. Applicable laws and regulations
2. Compliance requirements
3. Filing obligations
4. Potential penalties for non-compliance
5. Required documentation
6. Timeframes and deadlines
7. Risk assessment (low/medium/high)
8. Specific recommendations

Return analysis in JSON format:
{
  "jurisdiction": "${jurisdiction}",
  "isCompliant": boolean,
  "riskLevel": "low|medium|high",
  "applicableLaws": ["law1", "law2"],
  "requirements": ["req1", "req2"],
  "filingObligations": ["filing1", "filing2"],
  "penalties": "description of penalties",
  "documentation": ["doc1", "doc2"],
  "timeframes": "timing requirements",
  "recommendations": ["rec1", "rec2"],
  "complianceScore": number (1-10)
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: `You are an international legal compliance expert with expertise in ${jurisdiction} law. Provide detailed, accurate compliance analysis.` 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.2
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const analysis = JSON.parse(data.choices[0].message.content);
      return analysis;
    }
  } catch (error) {
    console.error(`Compliance analysis failed for ${jurisdiction}:`, error);
  }

  // Fallback analysis
  return {
    jurisdiction,
    isCompliant: false,
    riskLevel: 'medium',
    applicableLaws: ['Local IP Laws'],
    requirements: ['Legal review required'],
    filingObligations: ['Check local requirements'],
    penalties: 'Varies by jurisdiction',
    documentation: ['Legal documentation'],
    timeframes: 'Consult local attorney',
    recommendations: ['Seek local legal counsel'],
    complianceScore: 5
  };
}

async function generateComplianceReport(
  userJurisdiction: string,
  jurisdictions: string[],
  complianceResults: any[],
  legalMatter: string
) {
  const compliantCount = complianceResults.filter(r => r.isCompliant).length;
  const totalCount = complianceResults.length;
  const overallScore = Math.round((compliantCount / totalCount) * 100);
  
  const highRiskJurisdictions = complianceResults.filter(r => r.riskLevel === 'high');
  const mediumRiskJurisdictions = complianceResults.filter(r => r.riskLevel === 'medium');

  let riskLevel = 'low';
  if (highRiskJurisdictions.length > 0) {
    riskLevel = 'high';
  } else if (mediumRiskJurisdictions.length > totalCount / 2) {
    riskLevel = 'medium';
  }

  const actionPlan = [
    `Priority 1: Address high-risk jurisdictions: ${highRiskJurisdictions.map(r => r.jurisdiction).join(', ')}`,
    `Priority 2: Review medium-risk jurisdictions: ${mediumRiskJurisdictions.map(r => r.jurisdiction).join(', ')}`,
    'Priority 3: Maintain compliance in low-risk jurisdictions',
    'Priority 4: Set up ongoing monitoring for regulatory changes'
  ];

  return {
    overallScore,
    riskLevel,
    actionPlan,
    summary: `${compliantCount}/${totalCount} jurisdictions compliant for ${legalMatter}`
  };
}

async function analyzeJurisdictionalConflicts(complianceResults: any[]) {
  const conflicts = [];
  const harmonizationOpportunities = [];

  // Compare requirements across jurisdictions
  for (let i = 0; i < complianceResults.length; i++) {
    for (let j = i + 1; j < complianceResults.length; j++) {
      const result1 = complianceResults[i];
      const result2 = complianceResults[j];

      // Check for conflicting requirements
      const conflict = findRequirementConflicts(result1, result2);
      if (conflict) {
        conflicts.push({
          jurisdictions: [result1.jurisdiction, result2.jurisdiction],
          conflict: conflict,
          severity: 'medium'
        });
      }

      // Check for harmonization opportunities
      const harmony = findHarmonizationOpportunities(result1, result2);
      if (harmony) {
        harmonizationOpportunities.push({
          jurisdictions: [result1.jurisdiction, result2.jurisdiction],
          opportunity: harmony
        });
      }
    }
  }

  return {
    conflicts,
    harmonizationOpportunities,
    conflictCount: conflicts.length,
    harmonyCount: harmonizationOpportunities.length
  };
}

function findRequirementConflicts(result1: any, result2: any) {
  // Simplified conflict detection
  if (result1.isCompliant !== result2.isCompliant) {
    return `Compliance status differs between ${result1.jurisdiction} and ${result2.jurisdiction}`;
  }
  
  return null;
}

function findHarmonizationOpportunities(result1: any, result2: any) {
  // Simplified harmony detection
  if (result1.complianceScore > 7 && result2.complianceScore > 7) {
    return `Both ${result1.jurisdiction} and ${result2.jurisdiction} have similar compliance frameworks`;
  }
  
  return null;
}

async function generateComplianceRecommendations(
  complianceResults: any[],
  conflictAnalysis: any,
  complianceLevel: string
) {
  const recommendations = [];

  // High-priority recommendations for non-compliant jurisdictions
  const nonCompliant = complianceResults.filter(r => !r.isCompliant);
  if (nonCompliant.length > 0) {
    recommendations.push({
      priority: 'high',
      category: 'compliance',
      title: 'Address Non-Compliant Jurisdictions',
      description: `Take immediate action in: ${nonCompliant.map(r => r.jurisdiction).join(', ')}`,
      actions: nonCompliant.flatMap(r => r.recommendations)
    });
  }

  // Conflict resolution recommendations
  if (conflictAnalysis.conflicts.length > 0) {
    recommendations.push({
      priority: 'medium',
      category: 'conflicts',
      title: 'Resolve Jurisdictional Conflicts',
      description: 'Address conflicting requirements across jurisdictions',
      actions: [
        'Consult with international legal experts',
        'Consider jurisdiction-specific variations',
        'Implement conflict resolution strategies'
      ]
    });
  }

  // Harmonization recommendations
  if (conflictAnalysis.harmonizationOpportunities.length > 0) {
    recommendations.push({
      priority: 'low',
      category: 'optimization',
      title: 'Leverage Harmonization Opportunities',
      description: 'Streamline compliance across similar jurisdictions',
      actions: [
        'Develop unified compliance templates',
        'Create shared documentation',
        'Implement parallel filing strategies'
      ]
    });
  }

  // Level-specific recommendations
  if (complianceLevel === 'comprehensive') {
    recommendations.push({
      priority: 'medium',
      category: 'monitoring',
      title: 'Ongoing Compliance Monitoring',
      description: 'Set up continuous compliance tracking',
      actions: [
        'Implement automated regulation monitoring',
        'Schedule quarterly compliance reviews',
        'Set up alert systems for regulatory changes'
      ]
    });
  }

  return recommendations;
}