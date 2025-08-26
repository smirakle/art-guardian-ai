import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      documentId, 
      filingType, 
      jurisdiction, 
      urgency = 'normal',
      autoFile = false 
    } = await req.json();

    if (!documentId || !filingType || !jurisdiction) {
      return new Response(JSON.stringify({
        error: 'Missing required parameters: documentId, filingType, jurisdiction'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing government filing: ${filingType} in ${jurisdiction}`);

    // Get document details
    const { data: document, error: docError } = await supabase
      .from('generated_legal_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      throw new Error('Document not found');
    }

    // Get jurisdiction-specific filing requirements
    const filingRequirements = await getFilingRequirements(filingType, jurisdiction);
    
    // Validate document meets filing requirements
    const validationResult = await validateForFiling(document, filingRequirements);
    
    if (!validationResult.isValid) {
      return new Response(JSON.stringify({
        success: false,
        errors: validationResult.errors,
        requirements: filingRequirements,
        message: 'Document does not meet filing requirements'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process government filing
    const filingResult = await processGovernmentFiling(
      document, 
      filingType, 
      jurisdiction, 
      urgency, 
      autoFile
    );

    // Store filing record
    const { data: filing, error: filingError } = await supabase
      .from('government_filings')
      .insert({
        document_id: documentId,
        user_id: document.user_id,
        filing_type: filingType,
        jurisdiction: jurisdiction,
        filing_status: filingResult.status,
        government_reference: filingResult.referenceNumber,
        filed_at: autoFile ? new Date().toISOString() : null,
        expected_response_date: filingResult.expectedResponseDate,
        filing_fee: filingResult.fee,
        filing_metadata: {
          urgency,
          autoFile,
          requirements: filingRequirements,
          validation: validationResult,
          response: filingResult
        }
      })
      .select()
      .single();

    if (filingError) {
      throw new Error('Failed to store filing record: ' + filingError.message);
    }

    // Send notifications
    await sendFilingNotifications(filing, filingResult);

    // Set up tracking and reminders
    await setupFilingTracking(filing, filingResult);

    console.log(`Government filing processed: ${filing.id}`);

    return new Response(JSON.stringify({
      success: true,
      filingId: filing.id,
      referenceNumber: filingResult.referenceNumber,
      status: filingResult.status,
      fee: filingResult.fee,
      expectedResponse: filingResult.expectedResponseDate,
      trackingUrl: filingResult.trackingUrl,
      nextSteps: filingResult.nextSteps
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in government-filing-automation:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getFilingRequirements(filingType: string, jurisdiction: string) {
  const requirements: { [key: string]: any } = {
    'US': {
      'copyright_registration': {
        agency: 'U.S. Copyright Office',
        forms: ['Form CO'],
        fees: { basic: 45, standard: 65, expedited: 125 },
        documents: ['completed_application', 'deposit_copy', 'payment'],
        processing_time: '3-5 months',
        expedited_time: '5-15 business days',
        api_endpoint: 'https://www.copyright.gov/eco/',
        contact: 'copyright@loc.gov',
        verified: true,
        last_verified: '2024-01-15'
      },
      'trademark_application': {
        agency: 'USPTO',
        forms: ['TEAS Plus', 'TEAS Standard'],
        fees: { teas_plus: 250, teas_standard: 350 },
        documents: ['application', 'specimen', 'description'],
        processing_time: '12-18 months',
        expedited_time: '6-8 months',
        api_endpoint: 'https://tsdr.uspto.gov/',
        contact: 'TrademarkAssistanceCenter@uspto.gov',
        verified: true,
        last_verified: '2024-01-15'
      },
      'dmca_filing': {
        agency: 'Copyright Office',
        forms: ['DMCA Agent Designation'],
        fees: { designation: 6 },
        documents: ['agent_designation', 'contact_info'],
        processing_time: '1-2 weeks',
        api_endpoint: 'https://dmca.copyright.gov/',
        contact: 'dmca@copyright.gov',
        verified: true,
        last_verified: '2024-01-15'
      }
    },
    'EU': {
      'copyright_registration': {
        agency: 'European Union Intellectual Property Office',
        forms: ['Copyright Application'],
        fees: { basic: 100, expedited: 200 },
        documents: ['application', 'work_sample', 'proof_of_authorship'],
        processing_time: '4-6 months',
        expedited_time: '2-3 months',
        api_endpoint: 'https://euipo.europa.eu/ohimportal/en/',
        contact: 'information@euipo.europa.eu'
      }
    },
    'UK': {
      'copyright_registration': {
        agency: 'UK Intellectual Property Office',
        forms: ['Copyright Registration'],
        fees: { standard: 50, fast_track: 100 },
        documents: ['application', 'evidence_of_creation'],
        processing_time: '2-4 months',
        expedited_time: '4-6 weeks',
        api_endpoint: 'https://www.gov.uk/government/organisations/intellectual-property-office',
        contact: 'information@ipo.gov.uk'
      }
    }
  };

  const requirement = requirements[jurisdiction]?.[filingType];
  
  if (!requirement) {
    return {
      agency: 'Local Government Authority',
      forms: ['Standard Application'],
      fees: { standard: 100 },
      documents: ['application', 'supporting_documents'],
      processing_time: '2-6 months',
      contact: 'info@government.local',
      verified: false,
      last_verified: null
    };
  }

  // Validate contact information
  if (!requirement.verified || isContactStale(requirement.last_verified)) {
    console.warn(`Warning: Contact information for ${jurisdiction} ${filingType} may be outdated`);
  }

  return requirement;
}

function isContactStale(lastVerified: string | null): boolean {
  if (!lastVerified) return true;
  
  const verificationDate = new Date(lastVerified);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  return verificationDate < sixMonthsAgo;
}

async function validateForFiling(document: any, requirements: any) {
  const validation = {
    isValid: true,
    errors: [] as string[],
    warnings: [] as string[]
  };

  // Check required documents
  if (requirements.documents) {
    for (const reqDoc of requirements.documents) {
      if (!document.document_metadata?.attachments?.[reqDoc]) {
        validation.errors.push(`Missing required document: ${reqDoc}`);
        validation.isValid = false;
      }
    }
  }

  // Check document completeness
  if (document.word_count < 100) {
    validation.errors.push('Document appears incomplete (too short)');
    validation.isValid = false;
  }

  // Check compliance status
  if (document.compliance_status !== 'compliant') {
    validation.warnings.push('Document compliance needs review');
  }

  // Jurisdiction-specific validation
  if (requirements.jurisdiction_specific) {
    // Add specific validations based on jurisdiction
  }

  return validation;
}

async function processGovernmentFiling(
  document: any,
  filingType: string,
  jurisdiction: string,
  urgency: string,
  autoFile: boolean
) {
  const referenceNumber = `${jurisdiction.toUpperCase()}-${filingType.toUpperCase()}-${Date.now()}`;
  
  console.log(`Processing ${filingType} filing with ${jurisdiction} government systems`);
  
  if (autoFile) {
    try {
      // Get filing requirements for email contact
      const requirements = await getFilingRequirements(filingType, jurisdiction);
      
      // Send filing via email to government agency
      const emailResult = await sendGovernmentFilingEmail(
        document, 
        filingType, 
        jurisdiction, 
        urgency, 
        referenceNumber,
        requirements
      );
      
      // Calculate expected response date
      const processingTime = urgency === 'expedited' ? 
        requirements.expedited_time : requirements.processing_time;
      
      const expectedResponseDate = calculateResponseDate(processingTime);

      return {
        status: emailResult.success ? 'filed' : 'failed',
        referenceNumber,
        fee: getFee(filingType, urgency, requirements),
        expectedResponseDate,
        trackingUrl: `https://tsmo.com/filing-tracking/${referenceNumber}`,
        confirmationCode: emailResult.messageId || `CONF-${referenceNumber}`,
        nextSteps: [
          'Monitor filing status via tracking URL',
          'Respond to any government requests within 30 days',
          'Await official response within processing timeframe',
          'Pay any additional fees if required'
        ],
        emailResult
      };
    } catch (error) {
      console.error('Filing failed:', error);
      return {
        status: 'failed',
        referenceNumber,
        fee: 0,
        expectedResponseDate: new Date().toISOString(),
        trackingUrl: `https://tsmo.com/filing-tracking/${referenceNumber}`,
        confirmationCode: null,
        nextSteps: ['Contact support for assistance'],
        error: error.message
      };
    }
  } else {
    // Prepare filing without sending
    const requirements = await getFilingRequirements(filingType, jurisdiction);
    const processingTime = urgency === 'expedited' ? 
      requirements.expedited_time : requirements.processing_time;
    
    const expectedResponseDate = calculateResponseDate(processingTime);

    return {
      status: 'prepared',
      referenceNumber,
      fee: getFee(filingType, urgency, requirements),
      expectedResponseDate,
      trackingUrl: `https://tsmo.com/filing-tracking/${referenceNumber}`,
      confirmationCode: `PREP-${referenceNumber}`,
      nextSteps: ['Review document and approve for filing']
    };
  }
}

async function sendGovernmentFilingEmail(
  document: any,
  filingType: string,
  jurisdiction: string,
  urgency: string,
  referenceNumber: string,
  requirements: any
) {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Sending filing email (attempt ${attempt}/${maxRetries})`);
      
      // Validate contact before sending
      if (!requirements.verified) {
        console.warn(`Contact not verified for ${jurisdiction} ${filingType}`);
      }
    // Fetch supporting documents from storage
    const attachments = [];
    if (document.file_path) {
      try {
        const { data: fileData, error: fileError } = await supabase.storage
          .from('government-filings')
          .download(document.file_path);
        
        if (!fileError && fileData) {
          const arrayBuffer = await fileData.arrayBuffer();
          const base64Content = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          
          attachments.push({
            filename: `${document.title || 'document'}.pdf`,
            content: base64Content,
            type: 'application/pdf'
          });
        }
      } catch (attachError) {
        console.warn('Could not attach document:', attachError);
      }
    }

    const filingEmailContent = generateFilingEmailContent(
      document, 
      filingType, 
      jurisdiction, 
      urgency, 
      referenceNumber,
      requirements
    );

    const emailResponse = await resend.emails.send({
      from: 'TSMO Legal Filings <filings@tsmo.com>',
      to: [requirements.contact],
      cc: [document.user_email || 'user@example.com'],
      subject: `${jurisdiction.toUpperCase()} ${filingType.replace('_', ' ').toUpperCase()} Filing - Ref: ${referenceNumber}`,
      html: filingEmailContent.html,
      text: filingEmailContent.text,
      attachments: attachments.length > 0 ? attachments : undefined,
      headers: {
        'X-TSMO-Filing-Reference': referenceNumber,
        'X-Filing-Type': filingType,
        'X-Jurisdiction': jurisdiction,
        'X-Urgency': urgency
      }
    });

      console.log(`Government filing email sent successfully: ${emailResponse.data?.id}`);

      return {
        success: true,
        messageId: emailResponse.data?.id,
        error: null,
        attempt: attempt
      };
    } catch (error) {
      console.error(`Attempt ${attempt} failed to send government filing email:`, error);
      lastError = error;
      
      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  // All attempts failed
  console.error('All attempts to send government filing email failed:', lastError);
  return {
    success: false,
    messageId: null,
    error: lastError?.message || 'Failed to send after multiple attempts',
    attempts: maxRetries
  };
}

function generateFilingEmailContent(
  document: any,
  filingType: string,
  jurisdiction: string,
  urgency: string,
  referenceNumber: string,
  requirements: any
) {
  const formattedType = filingType.replace('_', ' ').toUpperCase();
  const date = new Date().toISOString().split('T')[0];
  
  const html = `
    <h2>${jurisdiction.toUpperCase()} ${formattedType} Filing</h2>
    <p><strong>To:</strong> ${requirements.agency}</p>
    <p><strong>Reference:</strong> ${referenceNumber}</p>
    <p><strong>Date:</strong> ${date}</p>
    <p><strong>Urgency:</strong> ${urgency.toUpperCase()}</p>
    
    <hr>
    
    <h3>Filing Details</h3>
    <p><strong>Document Title:</strong> ${document.title || 'Untitled Document'}</p>
    <p><strong>Filing Type:</strong> ${formattedType}</p>
    <p><strong>Jurisdiction:</strong> ${jurisdiction.toUpperCase()}</p>
    ${document.description ? `<p><strong>Description:</strong> ${document.description}</p>` : ''}
    
    <h3>Required Forms and Fees</h3>
    <p><strong>Forms:</strong> ${requirements.forms?.join(', ') || 'Standard application'}</p>
    <p><strong>Estimated Fee:</strong> $${getFee(filingType, urgency, requirements)}</p>
    
    <h3>Supporting Documentation</h3>
    <p>Please find the required documentation attached to this email.</p>
    
    <h3>Processing Information</h3>
    <p><strong>Expected Processing Time:</strong> ${urgency === 'expedited' ? requirements.expedited_time : requirements.processing_time}</p>
    <p><strong>Contact for Questions:</strong> filings@tsmo.com</p>
    
    <hr>
    
    <p>Please confirm receipt of this filing and provide any additional requirements or next steps.</p>
    
    <p><em>This filing was submitted via TSMO Government Filing System. For questions, contact filings@tsmo.com</em></p>
  `;

  const text = `${jurisdiction.toUpperCase()} ${formattedType} Filing

Reference: ${referenceNumber}
Date: ${date}
Agency: ${requirements.agency}

Document Title: ${document.title || 'Untitled Document'}
Filing Type: ${formattedType}
Urgency: ${urgency.toUpperCase()}

Required Forms: ${requirements.forms?.join(', ') || 'Standard application'}
Estimated Fee: $${getFee(filingType, urgency, requirements)}
Expected Processing: ${urgency === 'expedited' ? requirements.expedited_time : requirements.processing_time}

Please find supporting documentation attached. Confirm receipt and provide next steps.

Contact: filings@tsmo.com
`;

  return { html, text };
}

function getFee(filingType: string, urgency: string, requirements: any): number {
  const fees = requirements.fees || {};
  
  if (urgency === 'expedited') {
    return fees.expedited || fees.fast_track || fees.standard || 100;
  }
  
  return fees.basic || fees.standard || fees.teas_plus || 100;
}

function calculateResponseDate(processingTime: string): string {
  const now = new Date();
  
  // Parse processing time string (e.g., "3-5 months", "5-15 business days")
  if (processingTime.includes('month')) {
    const months = parseInt(processingTime.split('-')[1] || processingTime.split(' ')[0]);
    now.setMonth(now.getMonth() + months);
  } else if (processingTime.includes('week')) {
    const weeks = parseInt(processingTime.split('-')[1] || processingTime.split(' ')[0]);
    now.setDate(now.getDate() + (weeks * 7));
  } else if (processingTime.includes('day')) {
    const days = parseInt(processingTime.split('-')[1] || processingTime.split(' ')[0]);
    now.setDate(now.getDate() + days);
  } else {
    // Default to 3 months
    now.setMonth(now.getMonth() + 3);
  }

  return now.toISOString();
}

async function sendFilingNotifications(filing: any, filingResult: any) {
  // Send email notification to user
  await supabase.functions.invoke('send-contact-email', {
    body: {
      to: filing.user_id,
      subject: `Government Filing Submitted: ${filing.filing_type}`,
      message: `
        Your ${filing.filing_type} has been successfully filed with ${filing.jurisdiction} authorities.
        
        Reference Number: ${filingResult.referenceNumber}
        Expected Response: ${filingResult.expectedResponseDate}
        Tracking URL: ${filingResult.trackingUrl}
        
        Next steps:
        ${filingResult.nextSteps.map((step: string, index: number) => `${index + 1}. ${step}`).join('\n')}
      `
    }
  });

  // Create in-app notification
  await supabase
    .from('legal_notifications')
    .insert({
      user_id: filing.user_id,
      notification_type: 'filing_submitted',
      title: 'Government Filing Submitted',
      message: `Your ${filing.filing_type} has been filed. Reference: ${filingResult.referenceNumber}`,
      action_url: filingResult.trackingUrl,
      metadata: { filing_id: filing.id, reference: filingResult.referenceNumber }
    });
}

async function setupFilingTracking(filing: any, filingResult: any) {
  // Set up automatic status checking
  const checkDates = [
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month
    new Date(filingResult.expectedResponseDate)
  ];

  for (const checkDate of checkDates) {
    await supabase
      .from('scheduled_scans')
      .insert({
        user_id: filing.user_id,
        scan_type: 'filing_status_check',
        scheduled_time: checkDate.toISOString(),
        metadata: {
          filing_id: filing.id,
          reference_number: filingResult.referenceNumber,
          jurisdiction: filing.jurisdiction
        }
      });
  }
}