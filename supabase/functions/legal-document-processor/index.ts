import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
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
      content: `**DIGITAL MILLENNIUM COPYRIGHT ACT TAKEDOWN NOTICE**

To: {{platformName}}
Date: {{currentDate}}

**NOTICE OF CLAIMED INFRINGEMENT**

I, {{fullName}}, certify under penalty of perjury that I am the owner, or authorized to act on behalf of the owner, of certain intellectual property rights.

**COPYRIGHT OWNER INFORMATION:**
Name: {{fullName}}
{{#businessName}}Company: {{businessName}}{{/businessName}}
Address: {{address}}
Email: {{email}}
{{#phone}}Phone: {{phone}}{{/phone}}

**INFRINGEMENT DETAILS:**
Work Title: {{workTitle}}
Work Description: {{workDescription}}
Creation Date: {{creationDate}}
Original Location: {{originalLocation}}

**INFRINGING MATERIAL:**
URL: {{infringingUrl}}
Description: {{infringementDescription}}

**SWORN STATEMENTS:**
I have a good faith belief that the use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.

I swear, under penalty of perjury, that the information in this notification is accurate and that I am the copyright owner, or am authorized to act on behalf of the owner.

**ELECTRONIC SIGNATURE:**
{{electronicSignature}}
Date: {{currentDate}}

---
This notice was generated on {{currentDate}} by TSMO Legal Document System.`
    },

    'cease-desist': {
      title: 'Cease and Desist Letter',
      content: `**CEASE AND DESIST LETTER**

{{currentDate}}

{{recipientName}}
{{recipientAddress}}

**RE: DEMAND TO CEASE AND DESIST COPYRIGHT INFRINGEMENT**

Dear {{recipientName}},

I am writing to demand that you immediately cease and desist the unauthorized use of my copyrighted work.

**COPYRIGHT OWNER:**
{{fullName}}
{{#businessName}}{{businessName}}{{/businessName}}
{{address}}

**INFRINGED WORK:**
Title: {{workTitle}}
Description: {{workDescription}}
Creation Date: {{creationDate}}
{{#copyrightRegistration}}Registration Number: {{copyrightRegistration}}{{/copyrightRegistration}}

**INFRINGING USE:**
Your unauthorized use at: {{infringingUrl}}
Description: {{infringementDescription}}

**DEMAND:**
You must immediately:
1. Remove all infringing content
2. Cease all unauthorized use
3. Provide written confirmation of compliance within 10 days

**LEGAL CONSEQUENCES:**
Failure to comply may result in legal action seeking monetary damages, injunctive relief, and attorney fees under 17 U.S.C. § 504.

Time is of the essence. I expect your prompt cooperation.

Sincerely,

{{electronicSignature}}
{{fullName}}
{{#businessName}}{{businessName}}{{/businessName}}

---
Generated by TSMO Legal Document System on {{currentDate}}`
    },

    'licensing-agreement': {
      title: 'Intellectual Property Licensing Agreement',
      content: `**INTELLECTUAL PROPERTY LICENSING AGREEMENT**

This Licensing Agreement ("Agreement") is entered into on {{currentDate}} between:

**LICENSOR:**
{{fullName}}
{{#businessName}}{{businessName}}{{/businessName}}
{{address}}

**LICENSEE:**
{{licenseeName}}
{{licenseeAddress}}

**1. LICENSED PROPERTY**
Work Title: {{workTitle}}
Description: {{workDescription}}
Medium: {{workMedium}}

**2. GRANT OF LICENSE**
Licensor grants Licensee a {{licenseType}} license to use the Licensed Property for {{permittedUses}}.

**3. TERRITORY**
This license is valid in: {{territory}}

**4. TERM**
License Duration: {{licenseDuration}}
Start Date: {{licenseStartDate}}
End Date: {{licenseEndDate}}

**5. ROYALTIES**
License Fee: {{licenseFee}}
Payment Terms: {{paymentTerms}}
{{#royaltyRate}}Royalty Rate: {{royaltyRate}}{{/royaltyRate}}

**6. RESTRICTIONS**
Licensee may NOT:
- {{restriction1}}
- {{restriction2}}
- {{restriction3}}

**7. TERMINATION**
This Agreement may be terminated for breach with {{terminationNotice}} days written notice.

**8. GOVERNING LAW**
This Agreement shall be governed by the laws of {{governingLaw}}.

IN WITNESS WHEREOF, the parties execute this Agreement.

**LICENSOR:**
{{electronicSignature}}
{{fullName}}
Date: {{currentDate}}

**LICENSEE:**
_________________________
{{licenseeName}}
Date: ___________

---
Generated by TSMO Legal Document System on {{currentDate}}`
    },

    'nft-terms': {
      title: 'NFT Terms of Use',
      content: `**NON-FUNGIBLE TOKEN (NFT) TERMS OF USE**

**CREATOR INFORMATION:**
{{fullName}}
{{#businessName}}{{businessName}}{{/businessName}}
{{#creatorWallet}}Wallet Address: {{creatorWallet}}{{/creatorWallet}}

**NFT DETAILS:**
Collection Name: {{collectionName}}
Token Name: {{tokenName}}
{{#tokenId}}Token ID: {{tokenId}}{{/tokenId}}
Blockchain: {{blockchainNetwork}}
{{#contractAddress}}Smart Contract: {{contractAddress}}{{/contractAddress}}

**1. OWNERSHIP RIGHTS**
By purchasing this NFT, you acquire:
- Ownership of the unique digital token
- Limited license to display the associated artwork
- Right to resell the NFT

**2. WHAT YOU DO NOT OWN**
You do NOT acquire:
- Copyright to the underlying artwork
- Right to reproduce or create derivatives
- Commercial usage rights beyond display

**3. CREATOR ROYALTIES**
Creator retains {{royaltyPercentage}}% royalty on all secondary sales.

**4. AUTHENTICITY GUARANTEE**
This NFT is an original creation by {{fullName}} minted on {{mintDate}}.
{{#blockchainHash}}Blockchain Hash: {{blockchainHash}}{{/blockchainHash}}
{{#ipfsHash}}IPFS Hash: {{ipfsHash}}{{/ipfsHash}}

**5. RESTRICTIONS**
Holder may NOT:
- Use artwork for commercial purposes without license
- Create derivative works
- Claim ownership of underlying copyright

**6. UTILITY AND BENEFITS**
{{#nftUtilities}}This NFT may include: {{nftUtilities}}{{/nftUtilities}}

**7. DISCLAIMER**
NFTs are speculative digital assets. Value may fluctuate. Creator makes no guarantees regarding future value or utility.

**8. GOVERNING LAW**
These terms are governed by {{governingLaw}} law.

---
Creator Signature: {{electronicSignature}}
Created: {{currentDate}}
Generated by TSMO Legal Document System`
    },

    'privacy-policy': {
      title: 'Privacy Policy',
      content: `**PRIVACY POLICY**

**Last Updated:** {{currentDate}}

**COMPANY INFORMATION:**
{{#businessName}}{{businessName}}{{/businessName}}
{{fullName}}
{{address}}
Email: {{email}}

**1. INFORMATION WE COLLECT**
We collect:
- Personal information you provide (name, email, address)
- Usage data and analytics
- Cookies and tracking technologies
{{#additionalDataTypes}}- {{additionalDataTypes}}{{/additionalDataTypes}}

**2. HOW WE USE INFORMATION**
We use your information to:
- Provide our services
- Communicate with you
- Improve our platform
{{#specificUseCases}}- {{specificUseCases}}{{/specificUseCases}}

**3. INFORMATION SHARING**
We may share information with:
- Service providers and business partners
- Legal authorities when required
{{#sharingScenarios}}- {{sharingScenarios}}{{/sharingScenarios}}

**4. DATA SECURITY**
We implement industry-standard security measures including:
- Encryption of sensitive data
- Regular security audits
- Access controls and authentication

**5. YOUR RIGHTS**
You have the right to:
- Access your personal information
- Correct inaccurate data
- Delete your information
- Opt-out of communications

**6. COOKIES**
We use cookies to:
- Remember your preferences
- Analyze site usage
- Provide personalized content

**7. THIRD-PARTY SERVICES**
{{#thirdPartyServices}}We integrate with: {{thirdPartyServices}}{{/thirdPartyServices}}

**8. CHILDREN'S PRIVACY**
We do not knowingly collect information from children under 13.

**9. INTERNATIONAL TRANSFERS**
{{#dataTransferLocations}}Data may be transferred to: {{dataTransferLocations}}{{/dataTransferLocations}}

**10. CHANGES TO POLICY**
We will notify you of material changes via {{notificationMethod}}.

**11. CONTACT US**
For privacy questions, contact:
{{#privacyEmail}}Email: {{privacyEmail}}{{/privacyEmail}}
{{#privacyContactAddress}}Address: {{privacyContactAddress}}{{/privacyContactAddress}}

---
Generated by TSMO Legal Document System on {{currentDate}}`
    },

    'terms-of-service': {
      title: 'Terms of Service',
      content: `**TERMS OF SERVICE**

**Last Updated:** {{currentDate}}

**SERVICE PROVIDER:**
{{#businessName}}{{businessName}}{{/businessName}}
{{fullName}}
{{address}}

**1. ACCEPTANCE OF TERMS**
By accessing {{serviceName}}, you agree to these Terms of Service.

**2. DESCRIPTION OF SERVICE**
{{serviceName}} provides: {{serviceDescription}}

**3. USER ACCOUNTS**
- You must provide accurate information
- You are responsible for account security
- One account per person/entity

**4. ACCEPTABLE USE**
You may NOT:
- Violate any laws or regulations
- Infringe on intellectual property rights
- Upload malicious content
{{#specificProhibitions}}- {{specificProhibitions}}{{/specificProhibitions}}

**5. INTELLECTUAL PROPERTY**
- We retain rights to our platform and content
- You retain rights to your submitted content
- You grant us license to host and display your content

**6. PAYMENT TERMS**
{{#subscriptionFees}}- Subscription fees: {{subscriptionFees}}{{/subscriptionFees}}
{{#paymentMethods}}- Payment method: {{paymentMethods}}{{/paymentMethods}}
{{#refundPolicy}}- Refund policy: {{refundPolicy}}{{/refundPolicy}}

**7. PRIVACY**
Your privacy is governed by our Privacy Policy.

**8. DISCLAIMERS**
Service provided "as is" without warranties. We disclaim liability for:
- Service interruptions
- Data loss
- Third-party content

**9. LIMITATION OF LIABILITY**
Our liability is limited to {{liabilityLimit}}.

**10. INDEMNIFICATION**
You agree to indemnify us against claims arising from your use.

**11. TERMINATION**
We may terminate accounts for:
- Terms violations
- Non-payment
{{#terminationReasons}}- {{terminationReasons}}{{/terminationReasons}}

**12. GOVERNING LAW**
These terms are governed by {{governingLaw}} law.

**13. DISPUTE RESOLUTION**
Disputes resolved through {{disputeResolutionMethod}}.

**14. CHANGES TO TERMS**
We may update terms with {{noticePeriod}} days notice.

**15. CONTACT INFORMATION**
{{#legalEmail}}Legal questions: {{legalEmail}}{{/legalEmail}}
{{#supportEmail}}Support: {{supportEmail}}{{/supportEmail}}

---
Generated by TSMO Legal Document System on {{currentDate}}`
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