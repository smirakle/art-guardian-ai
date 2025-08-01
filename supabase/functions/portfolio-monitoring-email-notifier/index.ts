import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailNotificationRequest {
  userId: string;
  type: 'high_risk_alert' | 'scan_complete' | 'weekly_summary' | 'portfolio_created';
  recipientEmail: string;
  portfolioId?: string;
  alertData?: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    const { userId, type, recipientEmail, portfolioId, alertData }: EmailNotificationRequest = await req.json();

    let subject = '';
    let emailContent = '';

    switch (type) {
      case 'high_risk_alert':
        subject = 'Critical: High-Risk Copyright Matches Detected';
        emailContent = `
          <h1>High-Risk Copyright Matches Found</h1>
          <p>We have detected ${alertData.highRiskCount} high-risk copyright matches in your portfolio monitoring scan.</p>
          <p><strong>Portfolio:</strong> ${alertData.portfolioName}</p>
          <p><strong>Total Matches:</strong> ${alertData.totalMatches}</p>
          <p><strong>Scan Date:</strong> ${new Date(alertData.scanDate).toLocaleDateString()}</p>
          <p>Please review these matches and take appropriate action to protect your intellectual property.</p>
          <p><a href="${alertData.dashboardUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Details</a></p>
        `;
        break;

      case 'scan_complete':
        subject = 'Portfolio Monitoring Scan Completed';
        emailContent = `
          <h1>Portfolio Scan Complete</h1>
          <p>Your portfolio monitoring scan has been completed successfully.</p>
          <p><strong>Portfolio:</strong> ${alertData.portfolioName}</p>
          <p><strong>Artworks Scanned:</strong> ${alertData.artworksScanned}</p>
          <p><strong>Total Matches:</strong> ${alertData.totalMatches}</p>
          <p><strong>High Risk:</strong> ${alertData.highRiskMatches}</p>
          <p><strong>Medium Risk:</strong> ${alertData.mediumRiskMatches}</p>
          <p><strong>Low Risk:</strong> ${alertData.lowRiskMatches}</p>
          <p><a href="${alertData.dashboardUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Results</a></p>
        `;
        break;

      case 'weekly_summary':
        // Fetch weekly summary data
        const { data: summaryData } = await supabaseClient
          .from('portfolio_monitoring_results')
          .select(`
            total_matches,
            high_risk_matches,
            medium_risk_matches,
            low_risk_matches,
            portfolios(name)
          `)
          .gte('scan_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .eq('portfolios.user_id', userId);

        const totalScans = summaryData?.length || 0;
        const totalMatches = summaryData?.reduce((sum, scan) => sum + scan.total_matches, 0) || 0;
        const highRiskMatches = summaryData?.reduce((sum, scan) => sum + scan.high_risk_matches, 0) || 0;

        subject = 'Weekly Portfolio Monitoring Summary';
        emailContent = `
          <h1>Weekly Monitoring Summary</h1>
          <p>Here's your portfolio monitoring activity for the past week:</p>
          <ul>
            <li><strong>Total Scans:</strong> ${totalScans}</li>
            <li><strong>Total Matches Found:</strong> ${totalMatches}</li>
            <li><strong>High-Risk Matches:</strong> ${highRiskMatches}</li>
          </ul>
          <p>Stay vigilant and protect your creative work!</p>
          <p><a href="${Deno.env.get('FRONTEND_URL')}/portfolio-monitoring" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Dashboard</a></p>
        `;
        break;

      case 'portfolio_created':
        subject = 'Portfolio Created Successfully';
        emailContent = `
          <h1>Portfolio Created</h1>
          <p>Your new portfolio "${alertData.portfolioName}" has been created successfully and monitoring is now active.</p>
          <p>We will scan the web regularly for unauthorized use of your creative work and notify you of any findings.</p>
          <p><a href="${alertData.dashboardUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Manage Portfolio</a></p>
        `;
        break;

      default:
        throw new Error(`Unknown notification type: ${type}`);
    }

    const emailResponse = await resend.emails.send({
      from: 'TSMO <noreply@tsmo.ai>',
      to: [recipientEmail],
      subject: subject,
      html: emailContent,
    });

    console.log('Email sent successfully:', emailResponse);

    // Log the notification action
    await supabaseClient.rpc('log_portfolio_monitoring_action', {
      user_id_param: userId,
      action_param: 'email_notification_sent',
      resource_type_param: 'notification',
      details_param: {
        type,
        recipient_email: recipientEmail,
        portfolio_id: portfolioId,
        subject
      }
    });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error in portfolio monitoring email notifier:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);