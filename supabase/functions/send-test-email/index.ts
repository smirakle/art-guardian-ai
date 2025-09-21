import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { Resend } from 'npm:resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

interface TestEmailRequest {
  to: string
  subject: string
  content: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { to, subject, content }: TestEmailRequest = await req.json()

    if (!to || !subject || !content) {
      throw new Error('Missing required fields: to, subject, content')
    }

    const emailResponse = await resend.emails.send({
      from: 'TSMO Technology <noreply@tsmowatch.com>',
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">TSMO Technology</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">AI-Powered Content Protection</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Email Setup Test</h2>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              ${content}
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                This is a test email from your TSMO Technology email marketing setup.
                If you received this, your email configuration is working correctly.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://tsmowatch.com" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Visit TSMO Technology
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© 2024 TSMO Technology. All rights reserved.</p>
            <p>
              <a href="https://tsmowatch.com/unsubscribe" style="color: #666;">Unsubscribe</a> | 
              <a href="https://tsmowatch.com/terms-and-privacy" style="color: #666;">Privacy Policy</a>
            </p>
          </div>
        </div>
      `,
    })

    console.log('Test email sent successfully:', emailResponse)

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id,
      message: 'Test email sent successfully' 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Error sending test email:', error)
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Failed to send test email',
      details: error.name === 'Error' ? 'Please check your Resend API key and domain configuration' : undefined
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})