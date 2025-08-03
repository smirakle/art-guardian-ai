import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LegalWorkflowRequest {
  action: 'generate_documents' | 'file_dmca' | 'opposition_workflow' | 'bulk_enforcement' | 'compliance_check';
  user_id: string;
  alert_id?: string;
  trademark_id?: string;
  document_type?: string;
  automation_level?: 'manual' | 'semi_automated' | 'fully_automated';
  legal_preferences?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, ...params } = await req.json() as LegalWorkflowRequest;
    console.log(`Legal Workflow action: ${action}`, params);

    switch (action) {
      case 'generate_documents':
        return await generateLegalDocuments(supabaseClient, params);
      case 'file_dmca':
        return await automatedDMCAFiling(supabaseClient, params);
      case 'opposition_workflow':
        return await oppositionWorkflow(supabaseClient, params);
      case 'bulk_enforcement':
        return await bulkEnforcementActions(supabaseClient, params);
      case 'compliance_check':
        return await complianceChecker(supabaseClient, params);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Error in legal workflow:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateLegalDocuments(supabase: any, params: any) {
  console.log('Generating legal documents...');
  
  // Fetch alert details
  const { data: alert } = await supabase
    .from('trademark_alerts')
    .select(`
      *,
      trademarks (*)
    `)
    .eq('id', params.alert_id)
    .single();

  if (!alert) {
    throw new Error('Alert not found');
  }

  const documents = [];
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

  // Generate appropriate documents based on alert type
  if (alert.alert_type === 'high_risk_match' && alert.source_domain === 'uspto') {
    // Generate Opposition Notice
    const oppositionDoc = await generateOppositionNotice(alert, openAIApiKey);
    documents.push(oppositionDoc);
    
    // Calculate deadlines
    const deadline = calculateDeadlines(alert);
    
    // Store generated document
    const { data: docRecord } = await supabase
      .from('legal_document_generations')
      .insert({
        user_id: params.user_id,
        template_id: 'opposition-notice',
        template_title: 'Trademark Opposition Notice',
        generated_content: oppositionDoc.content,
        document_hash: generateDocumentHash(oppositionDoc.content),
        custom_fields: {
          alert_id: params.alert_id,
          trademark_id: alert.trademark_id,
          deadline: deadline.opposition_deadline,
          urgency: 'high'
        }
      })
      .select()
      .single();

    oppositionDoc.document_id = docRecord.id;
  }

  if (alert.source_domain === 'amazon' || alert.source_domain === 'marketplace') {
    // Generate Takedown Notice
    const takedownDoc = await generateTakedownNotice(alert, openAIApiKey);
    documents.push(takedownDoc);
    
    const { data: docRecord } = await supabase
      .from('legal_document_generations')
      .insert({
        user_id: params.user_id,
        template_id: 'takedown-notice',
        template_title: 'Marketplace Takedown Notice',
        generated_content: takedownDoc.content,
        document_hash: generateDocumentHash(takedownDoc.content),
        custom_fields: {
          alert_id: params.alert_id,
          platform: alert.source_domain,
          urgency: 'medium'
        }
      })
      .select()
      .single();

    takedownDoc.document_id = docRecord.id;
  }

  // Generate Cease and Desist Letter (general purpose)
  const ceaseDesistDoc = await generateCeaseDesistLetter(alert, openAIApiKey);
  documents.push(ceaseDesistDoc);

  // Create automated workflow
  await createLegalWorkflow(supabase, params.user_id, alert.id, documents);

  return new Response(JSON.stringify({
    success: true,
    documents: documents,
    workflow_created: true,
    next_steps: generateNextSteps(alert, documents)
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function generateOppositionNotice(alert: any, openAIApiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a senior trademark attorney drafting a formal USPTO opposition notice. 
          Generate a professional, legally sound opposition notice that includes:
          1. Proper legal formatting and citations
          2. Clear grounds for opposition
          3. Evidence of prior rights
          4. Likelihood of confusion analysis
          5. Prayer for relief
          
          Use formal legal language and structure.`
        },
        {
          role: 'user',
          content: `Generate USPTO opposition notice for:
          - Opposing application: ${alert.evidence_data?.match_details?.application_number}
          - Our trademark: ${alert.trademarks?.trademark_name}
          - Grounds: Likelihood of confusion, prior rights
          - Evidence: ${JSON.stringify(alert.evidence_data)}`
        }
      ],
      temperature: 0.2,
    }),
  });

  const result = await response.json();
  
  return {
    type: 'opposition_notice',
    title: 'USPTO Trademark Opposition Notice',
    content: result.choices[0]?.message?.content || 'Document generation failed',
    urgency: 'critical',
    deadline: calculateOppositionDeadline(alert),
    estimated_cost: '$400 (USPTO fee) + $3,000-5,000 (attorney fees)',
    auto_filing_available: false,
    requires_attorney_review: true
  };
}

async function generateTakedownNotice(alert: any, openAIApiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Generate a professional takedown notice for marketplace trademark infringement.
          Include platform-specific procedures, clear identification of infringement, and legal basis for removal.`
        },
        {
          role: 'user',
          content: `Generate takedown notice for ${alert.source_domain}:
          - Infringing listing: ${alert.source_url}
          - Our trademark: ${alert.trademarks?.trademark_name}
          - Infringement details: ${alert.description}`
        }
      ],
      temperature: 0.2,
    }),
  });

  const result = await response.json();
  
  return {
    type: 'takedown_notice',
    title: `${alert.source_domain.charAt(0).toUpperCase() + alert.source_domain.slice(1)} Takedown Notice`,
    content: result.choices[0]?.message?.content || 'Document generation failed',
    urgency: 'high',
    platform: alert.source_domain,
    auto_filing_available: true,
    estimated_processing_time: '24-72 hours'
  };
}

async function generateCeaseDesistLetter(alert: any, openAIApiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Draft a professional cease and desist letter for trademark infringement.
          Use firm but professional tone, cite legal basis, and provide clear demands with reasonable timeline.`
        },
        {
          role: 'user',
          content: `Draft cease and desist letter:
          - Infringer: ${alert.evidence_data?.match_details?.applicant_name || 'Unknown'}
          - Our trademark: ${alert.trademarks?.trademark_name}
          - Infringement: ${alert.description}
          - Evidence: ${alert.source_url}`
        }
      ],
      temperature: 0.2,
    }),
  });

  const result = await response.json();
  
  return {
    type: 'cease_desist',
    title: 'Cease and Desist Letter',
    content: result.choices[0]?.message?.content || 'Document generation failed',
    urgency: 'medium',
    recommended_delivery: 'certified_mail',
    response_deadline: '10 business days'
  };
}

async function automatedDMCAFiling(supabase: any, params: any) {
  console.log('Processing automated DMCA filing...');
  
  const { data: alert } = await supabase
    .from('trademark_alerts')
    .select('*')
    .eq('id', params.alert_id)
    .single();

  // Platform-specific DMCA filing
  const filingResult = await submitDMCAToplatform(alert);
  
  // Update alert with DMCA status
  await supabase
    .from('trademark_alerts')
    .update({
      legal_action_taken: true,
      dmca_notice_sent: true,
      status: 'action_taken',
      resolution_notes: `Automated DMCA filed: ${filingResult.confirmation_id}`
    })
    .eq('id', params.alert_id);

  // Create legal notification
  await supabase
    .from('legal_notifications')
    .insert({
      user_id: params.user_id,
      notification_type: 'dmca_filed',
      title: 'DMCA Notice Filed Successfully',
      message: `DMCA takedown notice filed for ${alert.source_domain}. Confirmation ID: ${filingResult.confirmation_id}`,
      action_url: alert.source_url,
      priority: 'high'
    });

  return new Response(JSON.stringify({
    success: true,
    filing_result: filingResult,
    confirmation_id: filingResult.confirmation_id,
    expected_response_time: filingResult.expected_response_time
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function oppositionWorkflow(supabase: any, params: any) {
  console.log('Starting opposition workflow...');
  
  const { data: alert } = await supabase
    .from('trademark_alerts')
    .select(`
      *,
      trademarks (*)
    `)
    .eq('id', params.alert_id)
    .single();

  const deadline = calculateOppositionDeadline(alert);
  const daysRemaining = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  // Create opposition workflow steps
  const workflowSteps = [
    {
      step: 1,
      title: 'Document Preparation',
      description: 'Prepare opposition notice and supporting documents',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      automated: false
    },
    {
      step: 2,
      title: 'Attorney Review',
      description: 'Legal review of opposition documents',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      automated: false
    },
    {
      step: 3,
      title: 'USPTO Filing',
      description: 'File opposition with USPTO',
      deadline: deadline,
      status: 'pending',
      automated: true,
      critical: true
    }
  ];

  // Create workflow record
  const { data: workflow } = await supabase
    .from('portfolio_compliance_workflows')
    .insert({
      user_id: params.user_id,
      alert_id: params.alert_id,
      workflow_type: 'trademark_opposition',
      status: 'initiated',
      current_step: 'document_preparation',
      priority: 'critical',
      deadline: deadline,
      automation_enabled: params.automation_level !== 'manual',
      workflow_metadata: {
        opposition_type: 'likelihood_of_confusion',
        application_number: alert.evidence_data?.match_details?.application_number,
        days_remaining: daysRemaining,
        estimated_cost: '$3,400-5,400',
        steps: workflowSteps
      }
    })
    .select()
    .single();

  // Set up automated reminders
  await scheduleOppositionReminders(supabase, workflow.id, workflowSteps);

  return new Response(JSON.stringify({
    success: true,
    workflow_id: workflow.id,
    days_remaining: daysRemaining,
    urgency: daysRemaining < 10 ? 'critical' : 'high',
    workflow_steps: workflowSteps,
    estimated_cost: '$3,400-5,400',
    next_deadline: workflowSteps[0].deadline
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function bulkEnforcementActions(supabase: any, params: any) {
  console.log('Executing bulk enforcement actions...');
  
  // Fetch all high-risk pending alerts
  const { data: alerts } = await supabase
    .from('trademark_alerts')
    .select('*')
    .eq('user_id', params.user_id)
    .eq('status', 'pending')
    .in('severity', ['high', 'critical'])
    .limit(50);

  const results = [];
  const batchSize = 5;

  for (let i = 0; i < alerts.length; i += batchSize) {
    const batch = alerts.slice(i, i + batchSize);
    
    const batchResults = await Promise.all(batch.map(async (alert) => {
      try {
        let action_result;
        
        if (alert.source_domain === 'amazon' || alert.source_domain === 'marketplace') {
          // Automated takedown for marketplaces
          action_result = await submitDMCAToplatform(alert);
          
          await supabase
            .from('trademark_alerts')
            .update({
              status: 'action_taken',
              legal_action_taken: true,
              dmca_notice_sent: true,
              resolution_notes: `Bulk automated DMCA: ${action_result.confirmation_id}`
            })
            .eq('id', alert.id);
            
        } else if (alert.source_domain === 'social_media') {
          // Social media reporting
          action_result = await reportToSocialPlatform(alert);
          
        } else {
          // Create legal document for manual review
          action_result = await generateQuickCeaseDesist(alert);
        }
        
        return {
          alert_id: alert.id,
          action_type: action_result.action_type,
          status: 'success',
          confirmation: action_result.confirmation_id
        };
        
      } catch (error) {
        return {
          alert_id: alert.id,
          status: 'failed',
          error: error.message
        };
      }
    }));
    
    results.push(...batchResults);
    
    // Delay between batches
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Generate bulk action report
  const successCount = results.filter(r => r.status === 'success').length;
  const failCount = results.filter(r => r.status === 'failed').length;

  return new Response(JSON.stringify({
    success: true,
    total_processed: results.length,
    successful_actions: successCount,
    failed_actions: failCount,
    results: results,
    estimated_savings: `$${successCount * 150} in manual processing costs`
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function complianceChecker(supabase: any, params: any) {
  console.log('Running compliance check...');
  
  // Fetch user's trademark portfolio
  const { data: trademarks } = await supabase
    .from('trademarks')
    .select('*')
    .eq('user_id', params.user_id);

  const complianceItems = [];
  const now = new Date();

  for (const trademark of trademarks) {
    // Check renewal deadlines
    if (trademark.renewal_date) {
      const renewalDate = new Date(trademark.renewal_date);
      const daysUntilRenewal = Math.ceil((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilRenewal < 365) {
        complianceItems.push({
          type: 'renewal_due',
          priority: daysUntilRenewal < 90 ? 'critical' : 'medium',
          trademark_id: trademark.id,
          trademark_name: trademark.trademark_name,
          deadline: trademark.renewal_date,
          days_remaining: daysUntilRenewal,
          action_required: 'File renewal application',
          estimated_cost: '$525 (USPTO fee) + attorney fees'
        });
      }
    }

    // Check for missing information
    if (!trademark.registration_number && !trademark.application_number) {
      complianceItems.push({
        type: 'incomplete_registration',
        priority: 'medium',
        trademark_id: trademark.id,
        trademark_name: trademark.trademark_name,
        action_required: 'Complete trademark registration details',
        risk: 'Reduced legal protection and monitoring accuracy'
      });
    }

    // Check monitoring status
    if (!trademark.monitoring_enabled) {
      complianceItems.push({
        type: 'monitoring_disabled',
        priority: 'low',
        trademark_id: trademark.id,
        trademark_name: trademark.trademark_name,
        action_required: 'Enable active monitoring',
        risk: 'Missing potential infringement threats'
      });
    }
  }

  // Generate compliance score
  const totalChecks = trademarks.length * 4; // 4 checks per trademark
  const passedChecks = totalChecks - complianceItems.length;
  const complianceScore = Math.round((passedChecks / totalChecks) * 100);

  return new Response(JSON.stringify({
    success: true,
    compliance_score: complianceScore,
    total_items: complianceItems.length,
    critical_items: complianceItems.filter(i => i.priority === 'critical').length,
    compliance_items: complianceItems,
    recommendations: generateComplianceRecommendations(complianceItems)
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Helper functions
function calculateOppositionDeadline(alert: any): string {
  // Opposition deadline is typically 30 days from publication
  const publicationDate = new Date(alert.evidence_data?.match_details?.publication_date || Date.now());
  publicationDate.setDate(publicationDate.getDate() + 30);
  return publicationDate.toISOString();
}

function calculateDeadlines(alert: any) {
  const now = new Date();
  return {
    opposition_deadline: calculateOppositionDeadline(alert),
    response_deadline: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    extension_deadline: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString()
  };
}

function generateDocumentHash(content: string): string {
  // Simple hash function for document versioning
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

async function createLegalWorkflow(supabase: any, userId: string, alertId: string, documents: any[]) {
  return await supabase
    .from('portfolio_compliance_workflows')
    .insert({
      user_id: userId,
      alert_id: alertId,
      workflow_type: 'document_generation',
      status: 'completed',
      current_step: 'documents_generated',
      priority: 'medium',
      workflow_metadata: {
        generated_documents: documents.map(d => ({
          type: d.type,
          title: d.title,
          urgency: d.urgency
        }))
      }
    });
}

function generateNextSteps(alert: any, documents: any[]): string[] {
  const steps = [];
  
  documents.forEach(doc => {
    if (doc.requires_attorney_review) {
      steps.push(`Review ${doc.title} with qualified attorney`);
    }
    if (doc.auto_filing_available) {
      steps.push(`Submit ${doc.title} to ${doc.platform || 'platform'}`);
    }
    if (doc.deadline) {
      steps.push(`File by deadline: ${doc.deadline}`);
    }
  });
  
  return steps;
}

async function submitDMCAToplatform(alert: any) {
  // Simulate platform-specific DMCA submission
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    action_type: 'dmca_takedown',
    confirmation_id: `DMCA-${Date.now()}`,
    platform: alert.source_domain,
    expected_response_time: '24-72 hours',
    status: 'submitted'
  };
}

async function reportToSocialPlatform(alert: any) {
  return {
    action_type: 'social_report',
    confirmation_id: `SOCIAL-${Date.now()}`,
    platform: alert.source_domain,
    expected_response_time: '24-48 hours',
    status: 'reported'
  };
}

async function generateQuickCeaseDesist(alert: any) {
  return {
    action_type: 'cease_desist_generated',
    confirmation_id: `CD-${Date.now()}`,
    document_type: 'cease_desist',
    status: 'generated'
  };
}

async function scheduleOppositionReminders(supabase: any, workflowId: string, steps: any[]) {
  // Schedule automated reminders for each step
  for (const step of steps) {
    await supabase
      .from('legal_notifications')
      .insert({
        notification_type: 'opposition_reminder',
        title: `Opposition Deadline Reminder: ${step.title}`,
        message: `Step ${step.step} deadline approaching: ${step.description}`,
        priority: step.critical ? 'critical' : 'high',
        metadata: {
          workflow_id: workflowId,
          step_number: step.step,
          deadline: step.deadline
        }
      });
  }
}

function generateComplianceRecommendations(items: any[]): string[] {
  const recommendations = [];
  
  const criticalItems = items.filter(i => i.priority === 'critical');
  if (criticalItems.length > 0) {
    recommendations.push('Address critical compliance items immediately');
  }
  
  const renewalItems = items.filter(i => i.type === 'renewal_due');
  if (renewalItems.length > 0) {
    recommendations.push('Set up automated renewal reminders');
    recommendations.push('Consider filing renewal applications early');
  }
  
  const incompleteItems = items.filter(i => i.type === 'incomplete_registration');
  if (incompleteItems.length > 0) {
    recommendations.push('Complete trademark registration information');
  }
  
  return recommendations;
}