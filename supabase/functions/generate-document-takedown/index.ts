import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

console.log("Generate Document Takedown function started");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) throw new Error("User not authenticated");

    const { matchId } = await req.json();
    console.log("Generating takedown notice for match:", matchId);

    const { data: match, error: matchError } = await supabase
      .from("document_plagiarism_matches")
      .select("*")
      .eq("id", matchId)
      .single();

    if (matchError || !match) {
      throw new Error("Match not found");
    }

    const noticeContent = generateDMCANotice(match, user);

    const { data: notice, error: noticeError } = await supabase
      .from("document_takedown_notices")
      .insert({
        match_id: matchId,
        user_id: user.id,
        notice_type: match.ai_training_detected ? "ai_training_objection" : "dmca",
        target_platform: match.source_domain || "Unknown Platform",
        target_url: match.source_url,
        notice_content: noticeContent,
        status: "pending",
        metadata: {
          generated_at: new Date().toISOString(),
          similarity_score: match.similarity_score,
          match_type: match.match_type
        }
      })
      .select()
      .single();

    if (noticeError) throw noticeError;

    console.log("Takedown notice generated successfully");

    return new Response(
      JSON.stringify({
        success: true,
        notice: notice,
        preview: noticeContent
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Takedown generation error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

function generateDMCANotice(match: any, user: any): string {
  const isAITraining = match.ai_training_detected;
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  if (isAITraining) {
    return `
AI TRAINING DATA OBJECTION NOTICE

Date: ${currentDate}

To: ${match.source_domain} Legal Department

FROM: ${user.email}

RE: Objection to Use of Copyrighted Written Content in AI Training Datasets

Dear Sir/Madam,

I am writing to formally object to the unauthorized use of my copyrighted written content in your AI training datasets.

INFRINGEMENT DETAILS:
- Source URL: ${match.source_url}
- Similarity Score: ${(match.similarity_score * 100).toFixed(1)}%
- Detection Method: ${match.detection_method}
- Detection Date: ${currentDate}

CONTENT IDENTIFICATION:
The infringing material consists of substantial portions of my original written work, identified through advanced plagiarism detection and content fingerprinting technology.

Matched Content Preview:
"${match.matched_content}"

I have a good faith belief that the use of my copyrighted content in your AI training datasets is not authorized by me, my agent, or the law. This unauthorized use violates my exclusive rights as the copyright owner.

I swear, under penalty of perjury, that the information in this notification is accurate and that I am the copyright owner or authorized to act on behalf of the owner.

REQUESTED ACTION:
1. Immediate removal of my content from all AI training datasets
2. Deletion of any derived models trained on my content
3. Written confirmation of removal within 14 days

Please respond to this notice at: ${user.email}

Respectfully,
${user.email}
Copyright Owner
    `.trim();
  } else {
    return `
DMCA TAKEDOWN NOTICE - WRITTEN CONTENT

Date: ${currentDate}

To: ${match.source_domain} DMCA Agent

FROM: ${user.email}

RE: Copyright Infringement Notification

Dear Sir/Madam,

I am writing to notify you of copyright infringement on your platform.

INFRINGING MATERIAL:
- Location: ${match.source_url}
- Similarity to Original: ${(match.similarity_score * 100).toFixed(1)}%

ORIGINAL WORK:
I am the owner of the original copyrighted written content that has been reproduced without authorization.

GOOD FAITH STATEMENT:
I have a good faith belief that use of the copyrighted material described above is not authorized by the copyright owner, its agent, or the law.

ACCURACY STATEMENT:
I swear, under penalty of perjury, that the information in this notification is accurate and that I am the copyright owner or am authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.

REQUESTED ACTION:
Please remove or disable access to the infringing material located at the URL above.

Contact Information:
Email: ${user.email}

Signature: ${user.email}
Date: ${currentDate}
    `.trim();
  }
}
