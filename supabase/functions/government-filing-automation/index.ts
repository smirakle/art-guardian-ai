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
        contact: 'copyright@loc.gov'
      },
      'trademark_application': {
        agency: 'USPTO',
        forms: ['TEAS Plus', 'TEAS Standard'],
        fees: { teas_plus: 250, teas_standard: 350 },
        documents: ['application', 'specimen', 'description'],
        processing_time: '12-18 months',
        expedited_time: '6-8 months',
        api_endpoint: 'https://tsdr.uspto.gov/',
        contact: 'TrademarkAssistanceCenter@uspto.gov'
      },
      'dmca_filing': {
        agency: 'Copyright Office',
        forms: ['DMCA Agent Designation'],
        fees: { designation: 6 },
        documents: ['agent_designation', 'contact_info'],
        processing_time: '1-2 weeks',
        api_endpoint: 'https://dmca.copyright.gov/',
        contact: 'dmca@copyright.gov'
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

  return requirements[jurisdiction]?.[filingType] || {
    agency: 'Local Government Authority',
    forms: ['Standard Application'],
    fees: { standard: 100 },
    documents: ['application', 'supporting_documents'],
    processing_time: '2-6 months',
    contact: 'info@government.local'
  };
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
  
  // Simulate government API integration
  console.log(`Filing ${filingType} with ${jurisdiction} government systems`);
  
  // In a real implementation, this would:
  // 1. Connect to actual government APIs
  // 2. Upload documents to official systems
  // 3. Pay fees through government payment systems
  // 4. Receive official confirmation
  
  const filingResponse = await simulateGovernmentAPI(
    document, 
    filingType, 
    jurisdiction, 
    urgency, 
    referenceNumber
  );

  // Calculate expected response date
  const requirements = await getFilingRequirements(filingType, jurisdiction);
  const processingTime = urgency === 'expedited' ? 
    requirements.expedited_time : requirements.processing_time;
  
  const expectedResponseDate = calculateResponseDate(processingTime);

  return {
    status: autoFile ? 'filed' : 'prepared',
    referenceNumber,
    fee: filingResponse.fee,
    expectedResponseDate,
    trackingUrl: `https://tracking.gov/${jurisdiction}/${referenceNumber}`,
    confirmationCode: filingResponse.confirmationCode,
    nextSteps: filingResponse.nextSteps
  };
}

async function simulateGovernmentAPI(
  document: any,
  filingType: string,
  jurisdiction: string,
  urgency: string,
  referenceNumber: string
) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const fees: { [key: string]: number } = {
    'copyright_registration': urgency === 'expedited' ? 125 : 65,
    'trademark_application': urgency === 'expedited' ? 500 : 350,
    'dmca_filing': 6
  };

  return {
    success: true,
    confirmationCode: `CONF-${referenceNumber}`,
    fee: fees[filingType] || 100,
    nextSteps: [
      'Monitor filing status via tracking URL',
      'Respond to any government requests within 30 days',
      'Await official response within processing timeframe',
      'Pay any additional fees if required'
    ]
  };
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