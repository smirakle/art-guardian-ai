import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { testType = 'connection', imageUrl } = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      console.error('[OpenAI Test] OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({
          success: false,
          message: 'OpenAI API key not configured in Supabase secrets',
          details: { error: 'Missing OPENAI_API_KEY environment variable' }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[OpenAI Test] Starting ${testType} test`);

    if (testType === 'connection') {
      // Test basic OpenAI connection with a simple completion
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Say "API connection successful" if you can read this.' }
          ],
          max_tokens: 50
        }),
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[OpenAI Test] Connection failed:', response.status, errorText);
        
        return new Response(
          JSON.stringify({
            success: false,
            message: `OpenAI API returned ${response.status}`,
            details: { 
              status: response.status, 
              error: errorText,
              possibleCause: response.status === 401 
                ? 'Invalid API key' 
                : response.status === 429 
                  ? 'Rate limit exceeded or insufficient quota'
                  : 'Unknown error'
            },
            responseTime
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      console.log('[OpenAI Test] Connection successful:', content);

      // Calculate estimated cost (GPT-4o-mini: $0.15/1M input tokens, $0.60/1M output tokens)
      const estimatedCost = (
        (data.usage.prompt_tokens * 0.15 / 1000000) +
        (data.usage.completion_tokens * 0.60 / 1000000)
      );

      return new Response(
        JSON.stringify({
          success: true,
          message: 'OpenAI API connection successful',
          details: {
            response: content,
            model: data.model
          },
          responseTime,
          tokenUsage: data.usage,
          estimatedCost
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (testType === 'vision') {
      // Test Vision API with image analysis
      const testImageUrl = imageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4';
      
      console.log('[OpenAI Test] Testing Vision API with image:', testImageUrl);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                { 
                  type: 'text', 
                  text: 'Describe this image in one sentence. What do you see?' 
                },
                {
                  type: 'image_url',
                  image_url: { url: testImageUrl }
                }
              ]
            }
          ],
          max_tokens: 100
        }),
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[OpenAI Test] Vision API failed:', response.status, errorText);
        
        return new Response(
          JSON.stringify({
            success: false,
            message: `Vision API returned ${response.status}`,
            details: { 
              status: response.status, 
              error: errorText,
              possibleCause: response.status === 401 
                ? 'Invalid API key' 
                : response.status === 429 
                  ? 'Rate limit exceeded or insufficient quota'
                  : response.status === 400
                    ? 'Invalid image URL or format'
                    : 'Unknown error'
            },
            responseTime
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      const analysis = data.choices?.[0]?.message?.content || '';
      
      console.log('[OpenAI Test] Vision analysis:', analysis);

      // Calculate estimated cost (GPT-4o: $2.50/1M input tokens, $10.00/1M output tokens)
      const estimatedCost = (
        (data.usage.prompt_tokens * 2.50 / 1000000) +
        (data.usage.completion_tokens * 10.00 / 1000000)
      );

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Vision API working correctly',
          details: {
            analysis,
            imageUrl: testImageUrl,
            model: data.model
          },
          responseTime,
          tokenUsage: data.usage,
          estimatedCost
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Invalid test type. Use "connection" or "vision"'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[OpenAI Test] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
        details: { error: String(error) }
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
