import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '')
    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader)
    
    if (!user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const { 
      templateId, 
      customFields = {}, 
      documentType = 'dmca_notice',
      urgencyLevel = 'normal',
      legalReviewRequired = false 
    } = await req.json()

    if (!templateId) {
      return new Response('Template ID is required', { status: 400, headers: corsHeaders })
    }

    console.log('Processing legal document for user:', user.id, 'template:', templateId)

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured')
    }

    // Get user profile for legal document personalization
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Define document templates
    const templates = {
      dmca_notice: {
        title: 'DMCA Takedown Notice',
        content: `DMCA TAKEDOWN NOTICE

To Whom It May Concern:

I am writing to notify you of intellectual property infringement occurring on your platform.

IDENTIFICATION OF COPYRIGHTED WORK:
- Work Title: {{work_title}}
- Copyright Owner: {{copyright_owner}}
- Original Publication Date: {{publication_date}}
- Copyright Registration: {{registration_number}}

IDENTIFICATION OF INFRINGING MATERIAL:
- Infringing URL: {{infringing_url}}
- Description: {{infringement_description}}
- Date of Infringement: {{infringement_date}}

CONTACT INFORMATION:
- Name: {{contact_name}}
- Address: {{contact_address}}
- Email: {{contact_email}}
- Phone: {{contact_phone}}

GOOD FAITH STATEMENT:
I have a good faith belief that the use of the copyrighted material described above is not authorized by the copyright owner, its agent, or the law.

ACCURACY STATEMENT:
I swear, under penalty of perjury, that the information in this notification is accurate and that I am the copyright owner or am authorized to act on behalf of the copyright owner.

Electronic Signature: {{electronic_signature}}
Date: {{current_date}}

{{additional_notes}}`
      },
      cease_desist: {
        title: 'Cease and Desist Letter',
        content: `CEASE AND DESIST NOTICE

{{recipient_name}}
{{recipient_address}}

RE: IMMEDIATE CESSATION OF COPYRIGHT INFRINGEMENT

Dear {{recipient_name}},

This letter serves as formal notice that you are infringing upon intellectual property rights owned by {{copyright_owner}}.

INFRINGING ACTIVITIES:
{{infringement_details}}

LEGAL BASIS:
Your actions constitute willful copyright infringement under 17 U.S.C. § 501, et seq.

DEMAND:
You must immediately:
1. Remove all infringing content
2. Cease all unauthorized use
3. Provide written confirmation of compliance

CONSEQUENCES:
Failure to comply within {{response_deadline}} days may result in:
- Federal court litigation
- Statutory damages up to $150,000 per work
- Attorney fees and costs

This letter is sent in good faith to resolve this matter without litigation.

Sincerely,
{{sender_name}}
{{sender_title}}
Date: {{current_date}}`
      },
      licensing_agreement: {
        title: 'Content Licensing Agreement',
        content: `CONTENT LICENSING AGREEMENT

This Agreement is entered into between {{licensor_name}} ("Licensor") and {{licensee_name}} ("Licensee").

GRANT OF LICENSE:
Licensor grants Licensee a {{license_type}} license to use the following content:
{{licensed_content}}

TERMS:
- License Duration: {{license_duration}}
- Territory: {{territory}}
- Usage Rights: {{usage_rights}}
- Attribution Requirements: {{attribution}}

COMPENSATION:
- License Fee: {{license_fee}}
- Payment Terms: {{payment_terms}}
- Royalty Rate: {{royalty_rate}}

RESTRICTIONS:
{{restrictions}}

TERMINATION:
This agreement may be terminated by {{termination_conditions}}.

{{additional_terms}}

Licensor: _________________________ Date: __________
{{licensor_name}}

Licensee: _________________________ Date: __________
{{licensee_name}}`
      }
    }

    const template = templates[templateId] || templates.dmca_notice

    // Use AI to enhance and customize the document
    const enhancementPrompt = `Enhance this legal document template with the provided information:

Template: ${template.content}

User Information:
- Name: ${profile?.full_name || 'User Name'}
- Email: ${user.email}

Custom Fields: ${JSON.stringify(customFields, null, 2)}

Please:
1. Fill in all placeholder fields with provided information
2. Enhance the legal language for ${urgencyLevel} urgency
3. Add jurisdiction-specific clauses if location is provided
4. Ensure compliance with current legal standards
5. Make it professional and legally sound

Return only the completed document text.`

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: enhancementPrompt }],
        max_tokens: 2000,
        temperature: 0.3
      })
    })

    if (!openaiResponse.ok) {
      throw new Error('Failed to enhance document with AI')
    }

    const openaiData = await openaiResponse.json()
    const enhancedContent = openaiData.choices[0].message.content

    // Generate document hash for integrity verification
    const encoder = new TextEncoder()
    const data = encoder.encode(enhancedContent)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const documentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // Store the generated document
    const { data: documentRecord, error: dbError } = await supabaseAdmin
      .from('legal_document_generations')
      .insert({
        user_id: user.id,
        template_id: templateId,
        template_title: template.title,
        generated_content: enhancedContent,
        custom_fields: customFields,
        document_hash: documentHash,
        legal_review_status: legalReviewRequired ? 'pending' : 'approved',
        expires_at: urgencyLevel === 'urgent' 
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to store document')
    }

    // Create legal notification if review is required
    if (legalReviewRequired) {
      await supabaseAdmin
        .from('legal_notifications')
        .insert({
          user_id: user.id,
          notification_type: 'document_review_required',
          title: 'Legal Document Review Required',
          message: `Your ${template.title} requires legal review before finalization.`,
          action_url: `/legal-templates?document=${documentRecord.id}`,
          priority: urgencyLevel === 'urgent' ? 'high' : 'normal',
          metadata: { document_id: documentRecord.id }
        })
    }

    const response = {
      success: true,
      documentId: documentRecord.id,
      document: {
        title: template.title,
        content: enhancedContent,
        hash: documentHash,
        status: documentRecord.legal_review_status,
        expiresAt: documentRecord.expires_at
      },
      metadata: {
        templateId,
        documentType,
        urgencyLevel,
        reviewRequired: legalReviewRequired,
        generatedAt: new Date().toISOString()
      }
    }

    console.log('Legal document processed successfully')

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Legal document processing error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: 'Legal document processing failed'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})