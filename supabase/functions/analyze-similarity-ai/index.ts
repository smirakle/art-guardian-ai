import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

console.log("AI Similarity Analysis function started");

interface AnalysisRequest {
  originalText: string;
  comparedText: string;
  matchUrl?: string;
  sessionId: string;
}

interface AnalysisResult {
  similarity_score: number;
  is_paraphrased: boolean;
  semantic_similarity: number;
  structural_similarity: number;
  key_concepts_matched: string[];
  analysis_details: string;
  confidence: number;
}

async function analyzeWithAI(originalText: string, comparedText: string): Promise<AnalysisResult> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY not configured");
  }

  const systemPrompt = `You are an advanced plagiarism detection AI. Analyze two texts for similarity, focusing on:
1. Semantic similarity (same meaning, different words)
2. Structural similarity (same organization/flow)
3. Paraphrasing detection
4. Key concept matching

Provide a detailed JSON analysis with:
- similarity_score (0-1): Overall similarity
- is_paraphrased (boolean): Whether text appears paraphrased
- semantic_similarity (0-1): Meaning similarity
- structural_similarity (0-1): Structure similarity
- key_concepts_matched (array): List of matched key concepts
- analysis_details (string): Brief explanation
- confidence (0-1): Confidence in the analysis`;

  const userPrompt = `Original text:
${originalText.substring(0, 2000)}

Compared text:
${comparedText.substring(0, 2000)}

Analyze these texts and return ONLY a valid JSON object with the specified fields.`;

  console.log("Calling Lovable AI for similarity analysis...");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Lovable AI error:", response.status, errorText);
    throw new Error(`AI analysis failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  console.log("AI response received:", content);

  // Parse JSON from response
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    return analysis;
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    // Return a fallback analysis
    return {
      similarity_score: 0.5,
      is_paraphrased: false,
      semantic_similarity: 0.5,
      structural_similarity: 0.5,
      key_concepts_matched: [],
      analysis_details: "AI analysis parsing failed",
      confidence: 0.3
    };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { originalText, comparedText, matchUrl, sessionId }: AnalysisRequest = await req.json();
    
    console.log("Analyzing similarity for session:", sessionId);
    console.log("Original text length:", originalText.length);
    console.log("Compared text length:", comparedText.length);

    if (!originalText || !comparedText) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Both originalText and comparedText are required" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Perform AI analysis
    const analysis = await analyzeWithAI(originalText, comparedText);
    
    console.log("AI Analysis complete:", {
      similarity_score: analysis.similarity_score,
      is_paraphrased: analysis.is_paraphrased,
      confidence: analysis.confidence
    });

    // Store AI analysis results if sessionId provided
    if (sessionId) {
      const { error: insertError } = await supabase
        .from("document_ai_analysis")
        .insert({
          session_id: sessionId,
          source_url: matchUrl,
          similarity_score: analysis.similarity_score,
          semantic_similarity: analysis.semantic_similarity,
          structural_similarity: analysis.structural_similarity,
          is_paraphrased: analysis.is_paraphrased,
          key_concepts_matched: analysis.key_concepts_matched,
          analysis_details: analysis.analysis_details,
          confidence: analysis.confidence,
          analyzed_at: new Date().toISOString()
        });

      if (insertError) {
        console.error("Error storing AI analysis:", insertError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in AI similarity analysis:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
