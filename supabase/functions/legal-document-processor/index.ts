import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LegalDocumentRequest {
  action: 'generate' | 'customize' | 'track_compliance' | 'review' | 'sign';
  templateId: string;
  customFields?: Record<string, any>;
  documentId?: string;
  signatureData?: any;
  complianceType?: string;
  jurisdiction?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const requestData: LegalDocumentRequest = await req.json();

    switch (requestData.action) {
      case 'generate':
        return await generateDocument(user.id, requestData);
      case 'customize':
        return await customizeTemplate(user.id, requestData);
      case 'track_compliance':
        return await trackCompliance(user.id, requestData);
      case 'review':
        return await reviewDocument(user.id, requestData);
      case 'sign':
        return await signDocument(user.id, requestData);
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Legal document processor error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateDocument(userId: string, request: LegalDocumentRequest) {
  // Get user's legal profile
  const { data: profile } = await supabase
    .from('user_legal_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!profile) {
    throw new Error('Legal profile not found. Please complete your legal profile first.');
  }

  // Get template content (this would come from your templates)
  const template = getTemplateContent(request.templateId);
  if (!template) {
    throw new Error('Template not found');
  }

  // Generate personalized content
  const personalizedContent = personalizeTemplate(template, profile, request.customFields || {});
  
  // Generate document hash for integrity verification
  const documentHash = await generateDocumentHash(personalizedContent);

  // Save generated document
  const { data: document, error } = await supabase
    .from('legal_document_generations')
    .insert({
      user_id: userId,
      template_id: request.templateId,
      template_title: template.title,
      generated_content: personalizedContent,
      custom_fields: request.customFields || {},
      document_hash: documentHash,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    })
    .select()
    .single();

  if (error) throw error;

  // Track template download
  await supabase
    .from('template_purchases')
    .insert({
      user_id: userId,
      template_id: request.templateId,
      template_title: template.title,
      amount_paid: 0, // Free for now
      status: 'completed'
    });

  return new Response(JSON.stringify({
    success: true,
    document: document,
    content: personalizedContent
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function customizeTemplate(userId: string, request: LegalDocumentRequest) {
  const { data: customization, error } = await supabase
    .from('legal_template_customizations')
    .upsert({
      user_id: userId,
      template_id: request.templateId,
      custom_fields: request.customFields || {},
      saved_name: `Custom ${request.templateId}`,
      is_default: true
    })
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({
    success: true,
    customization: customization
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function trackCompliance(userId: string, request: LegalDocumentRequest) {
  if (!request.documentId || !request.complianceType || !request.jurisdiction) {
    throw new Error('Missing required compliance tracking parameters');
  }

  const { data: tracking, error } = await supabase
    .from('legal_compliance_tracking')
    .insert({
      user_id: userId,
      document_id: request.documentId,
      compliance_type: request.complianceType,
      jurisdiction: request.jurisdiction,
      status: 'initiated'
    })
    .select()
    .single();

  if (error) throw error;

  // Set up automatic reminders
  const deadlineDate = calculateComplianceDeadline(request.complianceType, request.jurisdiction);
  if (deadlineDate) {
    await supabase
      .from('legal_compliance_tracking')
      .update({ deadline_date: deadlineDate })
      .eq('id', tracking.id);
  }

  return new Response(JSON.stringify({
    success: true,
    tracking: tracking,
    deadline: deadlineDate
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function reviewDocument(userId: string, request: LegalDocumentRequest) {
  if (!request.documentId) {
    throw new Error('Document ID required for review');
  }

  // Update document status
  const { data: document, error } = await supabase
    .from('legal_document_generations')
    .update({
      legal_review_status: 'pending',
      legal_review_date: new Date().toISOString()
    })
    .eq('id', request.documentId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({
    success: true,
    document: document,
    message: 'Document submitted for legal review'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function signDocument(userId: string, request: LegalDocumentRequest) {
  if (!request.documentId || !request.signatureData) {
    throw new Error('Document ID and signature data required');
  }

  const { data: document, error } = await supabase
    .from('legal_document_generations')
    .update({
      is_signed: true,
      signature_data: request.signatureData
    })
    .eq('id', request.documentId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({
    success: true,
    document: document,
    message: 'Document signed successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function getTemplateContent(templateId: string) {
  const templates = {
    'dmca-takedown': {
      title: 'DMCA Takedown Notice',
      content: `DMCA TAKEDOWN NOTICE

To: [Service Provider/Website Owner]
Date: {{currentDate}}

RE: Notice of Infringement under Digital Millennium Copyright Act (DMCA)

Dear Sir/Madam,

I am writing to notify you of copyright infringement occurring on your platform.

COPYRIGHT OWNER INFORMATION:
Name: {{fullName}}
{{#businessName}}Company: {{businessName}}{{/businessName}}
Address: {{address}}
Phone: {{phone}}
Email: {{email}}

COPYRIGHTED WORK:
I am the owner of the following copyrighted work:
- Title: {{workTitle}}
- Description: {{workDescription}}
- Date of Creation: {{creationDate}}
{{#registrationNumber}}
- Registration Number: {{registrationNumber}}
{{/registrationNumber}}

INFRINGING MATERIAL:
The following material on your website infringes my copyright:
- URL: {{infringingUrl}}
- Description of Infringement: {{infringementDescription}}

GOOD FAITH STATEMENT:
I have a good faith belief that use of the copyrighted material described above is not authorized by the copyright owner, its agent, or the law.

ACCURACY STATEMENT:
I swear, under penalty of perjury, that the information in this notification is accurate and that I am the copyright owner or am authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.

ELECTRONIC SIGNATURE:
{{fullName}}
{{currentDate}}

Please remove or disable access to the infringing material immediately.

Thank you for your prompt attention to this matter.

Sincerely,
{{fullName}}`
    }
  };

  return templates[templateId] || null;
}

function personalizeTemplate(template: any, profile: any, customFields: any) {
  let content = template.content;
  
  // Replace profile data
  content = content.replace(/{{fullName}}/g, profile.full_name || '[Your Name]');
  content = content.replace(/{{businessName}}/g, profile.business_name || '');
  content = content.replace(/{{address}}/g, formatAddress(profile));
  content = content.replace(/{{phone}}/g, profile.phone || '[Your Phone]');
  content = content.replace(/{{email}}/g, profile.email || '[Your Email]');
  content = content.replace(/{{currentDate}}/g, new Date().toLocaleDateString());
  
  // Replace custom fields
  Object.entries(customFields).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    content = content.replace(regex, String(value));
  });
  
  // Handle conditional blocks
  content = content.replace(/{{#businessName}}.*?{{\/businessName}}/gs, 
    profile.business_name ? `Company: ${profile.business_name}` : '');
  
  return content;
}

function formatAddress(profile: any) {
  const parts = [
    profile.address_line_1,
    profile.address_line_2,
    profile.city,
    profile.state_province,
    profile.postal_code,
    profile.country
  ].filter(Boolean);
  
  return parts.join(', ');
}

async function generateDocumentHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function calculateComplianceDeadline(complianceType: string, jurisdiction: string): Date | null {
  const now = new Date();
  
  switch (complianceType) {
    case 'dmca_filing':
      return new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days
    case 'copyright_registration':
      return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days
    case 'contract_execution':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    default:
      return null;
  }
}