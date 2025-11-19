import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SignupNotificationRequest {
  userId: string;
  email: string;
  fullName: string;
  username?: string;
  signupTime: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email, fullName, username, signupTime }: SignupNotificationRequest = await req.json();

    console.log(`Sending new user signup notification for: ${email}`);

    const adminEmail = "shirleena.cunningham@tsmowatch.com";
    const signupDate = new Date(signupTime).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'long'
    });

    const emailResponse = await resend.emails.send({
      from: "TSMO Alerts <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `🎉 New User Signup - ${fullName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .user-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .user-detail { margin: 12px 0; }
            .label { font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
            .value { font-size: 16px; color: #1f2937; margin-top: 4px; }
            .user-id { font-family: monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 14px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; font-weight: 500; }
            .button:hover { background: #5a67d8; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
            .emoji { font-size: 24px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="emoji">🎉</div>
              <h1>New User Signup</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">A new user has joined TSMO!</p>
            </div>
            <div class="content">
              <div class="user-card">
                <div class="user-detail">
                  <div class="label">Full Name</div>
                  <div class="value">${fullName}</div>
                </div>
                <div class="user-detail">
                  <div class="label">Email Address</div>
                  <div class="value">${email}</div>
                </div>
                ${username ? `
                <div class="user-detail">
                  <div class="label">Username</div>
                  <div class="value">${username}</div>
                </div>
                ` : ''}
                <div class="user-detail">
                  <div class="label">User ID</div>
                  <div class="value user-id">${userId}</div>
                </div>
                <div class="user-detail">
                  <div class="label">Signup Time</div>
                  <div class="value">${signupDate}</div>
                </div>
                <div class="user-detail">
                  <div class="label">Role Assigned</div>
                  <div class="value">User (Default)</div>
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://utneaqmbyjwxaqrrarpc.supabase.co/dashboard/project/utneaqmbyjwxaqrrarpc/auth/users" class="button">
                  View in Supabase Dashboard
                </a>
                <a href="https://tsmowatch.com/admin" class="button">
                  View in Admin Panel
                </a>
              </div>
            </div>
            <div class="footer">
              <p>This is an automated notification from TSMO. You're receiving this because you're an administrator.</p>
              <p style="margin-top: 10px; font-size: 12px;">Notification sent at ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("New user signup notification sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, messageId: emailResponse.data?.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending new user signup notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
