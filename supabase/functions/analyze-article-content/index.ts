import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ArticleAnalysis {
  isArticle: boolean;
  confidence: number;
  contentType: string;
  title?: string;
  author?: string;
  publishDate?: string;
  wordCount: number;
  readingTime: number;
  topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  quality: 'low' | 'medium' | 'high';
  copyrightRisk: 'low' | 'medium' | 'high';
  suggestions: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, content, artworkId } = await req.json();

    if (!openAIApiKey) {
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured',
        analysis: null 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Analyzing article content for URL:', url);
    
    // Fetch content if not provided
    let articleContent = content;
    if (!articleContent && url) {
      try {
        const response = await fetch(url);
        articleContent = await response.text();
      } catch (error) {
        console.error('Error fetching URL:', error);
        return new Response(JSON.stringify({ 
          error: 'Failed to fetch URL content',
          analysis: null 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Basic content analysis
    const wordCount = articleContent.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed

    // Use OpenAI to analyze the article
    const analysisPrompt = `
    Analyze the following web content and determine if it's an article, blog post, or other written content. 
    Provide a detailed analysis including:
    
    1. Is this content an article/blog post? (confidence 0-100)
    2. Content type (news article, blog post, opinion piece, review, etc.)
    3. Title extraction
    4. Author if mentioned
    5. Publication date if found
    6. Main topics/themes (max 5)
    7. Content sentiment (positive, neutral, negative)
    8. Content quality assessment (low, medium, high)
    9. Copyright risk assessment based on originality
    10. Suggestions for content protection

    Content to analyze:
    ${articleContent.substring(0, 4000)} // Limit content size
    
    Respond in JSON format with the structure:
    {
      "isArticle": boolean,
      "confidence": number,
      "contentType": "string",
      "title": "string or null",
      "author": "string or null", 
      "publishDate": "string or null",
      "topics": ["string array"],
      "sentiment": "positive|neutral|negative",
      "quality": "low|medium|high",
      "copyrightRisk": "low|medium|high",
      "suggestions": ["string array"]
    }
    `;

    console.log('Sending analysis request to OpenAI...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert content analyst specializing in identifying and analyzing online articles, blog posts, and written content for copyright protection purposes. Respond only with valid JSON.' 
          },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
      throw new Error('Invalid OpenAI response');
    }

    let aiAnalysis: Partial<ArticleAnalysis>;
    try {
      aiAnalysis = JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      // Fallback analysis
      aiAnalysis = {
        isArticle: wordCount > 100,
        confidence: wordCount > 100 ? 75 : 25,
        contentType: 'unknown',
        sentiment: 'neutral',
        quality: wordCount > 500 ? 'medium' : 'low',
        copyrightRisk: 'medium',
        topics: [],
        suggestions: ['Enable monitoring', 'Set up alerts']
      };
    }

    // Combine AI analysis with basic metrics
    const finalAnalysis: ArticleAnalysis = {
      isArticle: aiAnalysis.isArticle || false,
      confidence: aiAnalysis.confidence || 50,
      contentType: aiAnalysis.contentType || 'unknown',
      title: aiAnalysis.title,
      author: aiAnalysis.author,
      publishDate: aiAnalysis.publishDate,
      wordCount,
      readingTime,
      topics: aiAnalysis.topics || [],
      sentiment: aiAnalysis.sentiment || 'neutral',
      quality: aiAnalysis.quality || 'medium',
      copyrightRisk: aiAnalysis.copyrightRisk || 'medium',
      suggestions: aiAnalysis.suggestions || []
    };

    console.log('Article analysis completed:', finalAnalysis);

    // Store analysis in database if artworkId is provided
    if (artworkId && finalAnalysis.isArticle) {
      try {
        await supabase.from('artwork').update({
          description: finalAnalysis.title || `${finalAnalysis.contentType} - ${finalAnalysis.wordCount} words`,
          tags: finalAnalysis.topics,
          updated_at: new Date().toISOString()
        }).eq('id', artworkId);

        console.log('Updated artwork record with analysis');
      } catch (dbError) {
        console.error('Database update error:', dbError);
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      analysis: finalAnalysis,
      url,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-article-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      analysis: null 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});