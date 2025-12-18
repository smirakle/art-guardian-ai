import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Production limits - tracked per user per day
const DAILY_LIMITS = {
  full_scan: 50,      // Total full scans per day
  serpapi_calls: 100, // Individual SerpAPI requests
  openai_calls: 200   // Individual OpenAI analysis calls
};

// Known AI training dataset domains and indicators
const AI_TRAINING_INDICATORS = {
  datasets: [
    { name: 'LAION', domains: ['laion.ai', 'laion5b.github.io', 'huggingface.co/datasets/laion'], type: 'image' },
    { name: 'Common Crawl', domains: ['commoncrawl.org', 'data.commoncrawl.org'], type: 'text' },
    { name: 'The Pile', domains: ['pile.eleuther.ai', 'the-eye.eu'], type: 'text' },
    { name: 'OpenWebText', domains: ['openwebtext2.readthedocs.io', 'skylion007.github.io'], type: 'text' },
    { name: 'C4 Dataset', domains: ['tensorflow.org/datasets/catalog/c4', 'huggingface.co/datasets/c4'], type: 'text' },
    { name: 'RedPajama', domains: ['together.xyz', 'huggingface.co/datasets/togethercomputer'], type: 'text' },
    { name: 'Conceptual Captions', domains: ['ai.google.com/research/ConceptualCaptions'], type: 'image' },
    { name: 'COCO Dataset', domains: ['cocodataset.org'], type: 'image' },
    { name: 'ImageNet', domains: ['image-net.org'], type: 'image' },
  ],
  scraping_services: [
    'archive.org', 'web.archive.org', 'commoncrawl.org', 'diffbot.com'
  ]
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting REAL AI training protection scan...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const serpApiKey = Deno.env.get('SERPAPI_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!serpApiKey) {
      throw new Error('SERPAPI_KEY is not configured. Required for real AI training detection.');
    }
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not configured. Required for AI analysis.');
    }

    const { userId, protectionRecordId } = await req.json().catch(() => ({}));

    // Check daily limit before proceeding
    if (userId) {
      const { data: usageCheck } = await supabase.rpc('check_daily_api_limit', {
        p_user_id: userId,
        p_service_type: 'full_scan',
        p_daily_limit: DAILY_LIMITS.full_scan
      });
      
      if (usageCheck && !usageCheck.allowed) {
        return new Response(JSON.stringify({
          error: 'Daily scan limit reached',
          daily_limit: DAILY_LIMITS.full_scan,
          reset_time: usageCheck.reset_time,
          hint: 'Your daily scan limit resets at midnight UTC'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429,
        });
      }
    }

    // Track API usage for cost monitoring
    let apiCallsUsed = { serpapi: 0, openai: 0 };

    // Build query for protected files
    let query = supabase
      .from('ai_protection_records')
      .select(`
        *,
        ai_document_tracers (
          tracer_type,
          tracer_payload,
          checksum
        )
      `)
      .eq('is_active', true);

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (protectionRecordId) {
      query = query.eq('id', protectionRecordId);
    }

    const { data: protectedFiles, error } = await query.limit(20);

    if (error) {
      throw new Error(`Failed to get protected files: ${error.message}`);
    }

    console.log(`Found ${protectedFiles?.length || 0} protected files to scan with REAL APIs`);

    let totalViolations = 0;
    const scanResults = [];

    for (const file of protectedFiles || []) {
      console.log(`Real API scan for: ${file.original_filename} (${file.content_type || 'image'})`);
      
      let violations = [];
      
      if (file.content_type === 'document') {
        violations = await scanDocumentForAITraining(file, serpApiKey, openaiApiKey);
      } else {
        violations = await scanImageForAITraining(file, serpApiKey, openaiApiKey);
      }
      
      // Store violations found
      for (const violation of violations) {
        const { error: insertError } = await supabase
          .from('ai_training_violations')
          .insert({
            protection_record_id: file.id,
            user_id: file.user_id,
            artwork_id: file.artwork_id,
            violation_type: violation.type,
            source_url: violation.source_url,
            source_domain: violation.domain,
            confidence_score: violation.confidence,
            evidence_data: violation.evidence,
            status: 'pending'
          });

        if (insertError) {
          console.error('Failed to insert violation:', insertError);
        } else {
          totalViolations++;
          console.log(`REAL violation detected for ${file.original_filename}: ${violation.domain}`);

          // Create notification for high-confidence violations
          if (violation.confidence > 0.8) {
            await supabase
              .from('ai_protection_notifications')
              .insert({
                user_id: file.user_id,
                notification_type: 'high_confidence_violation',
                title: 'AI Training Violation Detected',
                message: `Your content "${file.original_filename}" was found in ${violation.evidence.dataset_name || violation.domain}`,
                severity: 'critical',
                action_url: `/ai-protection?violation=${file.id}`,
                metadata: {
                  violation_type: violation.type,
                  confidence: violation.confidence,
                  source_url: violation.source_url
                }
              });
          }
        }
      }

      // Update scan metadata
      await supabase
        .from('ai_protection_records')
        .update({
          metadata: {
            ...file.metadata,
            last_scan: new Date().toISOString(),
            scan_count: (file.metadata?.scan_count || 0) + 1,
            scan_type: 'real_api',
            apis_used: ['serpapi', 'openai_vision']
          }
        })
        .eq('id', file.id);

      scanResults.push({
        file_id: file.id,
        filename: file.original_filename,
        violations_found: violations.length
      });
    }

    console.log(`Real API scan completed. Found ${totalViolations} violations.`);

    return new Response(JSON.stringify({
      success: true,
      files_scanned: protectedFiles?.length || 0,
      violations_found: totalViolations,
      scan_type: 'real_api',
      apis_used: ['serpapi_reverse_image', 'serpapi_google', 'openai_gpt4_vision'],
      scan_timestamp: new Date().toISOString(),
      results: scanResults
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('AI Protection Scanner error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      hint: 'Ensure SERPAPI_KEY and OPENAI_API_KEY are configured'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// Real image scanning using SerpAPI reverse image search + AI training dataset detection
async function scanImageForAITraining(file: any, serpApiKey: string, openaiKey: string) {
  const violations = [];
  
  // Skip if no file path
  if (!file.protected_file_path && !file.file_fingerprint) {
    console.log(`Skipping ${file.original_filename}: no file path`);
    return violations;
  }

  try {
    // Step 1: Search for the image using reverse image search
    const imageUrl = file.protected_file_path;
    
    if (imageUrl) {
      console.log(`Performing reverse image search for: ${file.original_filename}`);
      
      const searchUrl = `https://serpapi.com/search.json?engine=google_reverse_image&image_url=${encodeURIComponent(imageUrl)}&api_key=${serpApiKey}`;
      
      const response = await fetch(searchUrl);
      
      if (response.ok) {
        const data = await response.json();
        
        // Check visual matches and inline images
        const allMatches = [
          ...(data.visual_matches || []),
          ...(data.inline_images || []),
          ...(data.image_results || [])
        ];

        console.log(`Found ${allMatches.length} potential matches for ${file.original_filename}`);

        // Check each match against AI training dataset indicators
        for (const match of allMatches.slice(0, 10)) {
          const sourceUrl = match.link || match.source || '';
          const title = match.title || '';
          
          // Check if found on AI training dataset sources
          for (const dataset of AI_TRAINING_INDICATORS.datasets) {
            const matchesDataset = dataset.domains.some(domain => 
              sourceUrl.toLowerCase().includes(domain) ||
              title.toLowerCase().includes(dataset.name.toLowerCase())
            );

            if (matchesDataset && dataset.type === 'image') {
              // Analyze with OpenAI to confirm
              const analysis = await analyzeWithOpenAI(
                match.thumbnail || match.original,
                file.original_filename,
                dataset.name,
                openaiKey
              );

              if (analysis.isMatch) {
                violations.push({
                  type: 'ai_training_dataset_inclusion',
                  source_url: sourceUrl,
                  domain: new URL(sourceUrl).hostname,
                  confidence: analysis.confidence,
                  evidence: {
                    detection_method: 'reverse_image_search_ai_analysis',
                    dataset_name: dataset.name,
                    match_title: title,
                    ai_analysis: analysis.reasoning,
                    search_engine: 'serpapi_google_reverse_image',
                    detection_timestamp: new Date().toISOString()
                  }
                });
              }
            }
          }

          // Also check for scraped/archived versions that could be used for training
          const isScraping = AI_TRAINING_INDICATORS.scraping_services.some(service =>
            sourceUrl.toLowerCase().includes(service)
          );

          if (isScraping) {
            violations.push({
              type: 'content_scraped_for_potential_training',
              source_url: sourceUrl,
              domain: new URL(sourceUrl).hostname,
              confidence: 0.7,
              evidence: {
                detection_method: 'scraping_service_detection',
                service_type: 'web_archive_scraper',
                match_title: title,
                detection_timestamp: new Date().toISOString()
              }
            });
          }
        }
      }
    }

    // Step 2: Search for content by filename/title in AI dataset repositories
    const titleSearchResults = await searchDatasetRepositories(file.original_filename, serpApiKey);
    violations.push(...titleSearchResults);

  } catch (error) {
    console.error(`Error scanning image ${file.original_filename}:`, error);
  }

  return violations;
}

// Real document scanning - search for text content in known AI training sources
async function scanDocumentForAITraining(file: any, serpApiKey: string, openaiKey: string) {
  const violations = [];

  try {
    // Extract key phrases from document for searching
    const searchTerms = extractSearchTerms(file);
    
    if (searchTerms.length === 0) {
      console.log(`No search terms extracted from ${file.original_filename}`);
      return violations;
    }

    console.log(`Searching for document content: ${searchTerms.slice(0, 2).join(', ')}...`);

    // Search each term in AI training dataset contexts
    for (const term of searchTerms.slice(0, 3)) {
      const searchQuery = `"${term}" site:huggingface.co OR site:github.com/datasets OR site:kaggle.com`;
      
      const searchUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(searchQuery)}&api_key=${serpApiKey}&num=10`;
      
      const response = await fetch(searchUrl);
      
      if (response.ok) {
        const data = await response.json();
        const results = data.organic_results || [];

        for (const result of results) {
          const url = result.link || '';
          const title = result.title || '';
          const snippet = result.snippet || '';

          // Check if this is an AI dataset repository
          const isDatasetRepo = 
            url.includes('huggingface.co/datasets') ||
            url.includes('github.com') && (title.toLowerCase().includes('dataset') || snippet.toLowerCase().includes('training')) ||
            url.includes('kaggle.com/datasets');

          if (isDatasetRepo) {
            // Use OpenAI to analyze if content matches
            const analysis = await analyzeTextMatch(term, snippet, openaiKey);

            if (analysis.isMatch) {
              violations.push({
                type: 'document_in_training_dataset',
                source_url: url,
                domain: new URL(url).hostname,
                confidence: analysis.confidence,
                evidence: {
                  detection_method: 'semantic_search_analysis',
                  matched_text: term,
                  dataset_snippet: snippet,
                  dataset_title: title,
                  ai_analysis: analysis.reasoning,
                  document_stats: {
                    word_count: file.word_count,
                    language: file.language
                  },
                  detection_timestamp: new Date().toISOString()
                }
              });
            }
          }
        }
      }
    }

    // Also search HuggingFace datasets directly
    const hfResults = await searchHuggingFace(file.original_filename, serpApiKey);
    violations.push(...hfResults);

  } catch (error) {
    console.error(`Error scanning document ${file.original_filename}:`, error);
  }

  return violations;
}

// Search AI dataset repositories for content
async function searchDatasetRepositories(filename: string, serpApiKey: string) {
  const violations = [];
  
  try {
    const cleanName = filename.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');
    const searchQuery = `"${cleanName}" (LAION OR dataset OR "training data" OR "image dataset")`;
    
    const searchUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(searchQuery)}&api_key=${serpApiKey}&num=5`;
    
    const response = await fetch(searchUrl);
    
    if (response.ok) {
      const data = await response.json();
      const results = data.organic_results || [];

      for (const result of results) {
        const url = result.link || '';
        
        for (const dataset of AI_TRAINING_INDICATORS.datasets) {
          const matchesDataset = dataset.domains.some(domain => 
            url.toLowerCase().includes(domain)
          );

          if (matchesDataset) {
            violations.push({
              type: 'content_indexed_in_dataset',
              source_url: url,
              domain: new URL(url).hostname,
              confidence: 0.75,
              evidence: {
                detection_method: 'dataset_repository_search',
                dataset_name: dataset.name,
                search_query: searchQuery,
                result_title: result.title,
                result_snippet: result.snippet,
                detection_timestamp: new Date().toISOString()
              }
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error searching dataset repositories:', error);
  }

  return violations;
}

// Search HuggingFace specifically
async function searchHuggingFace(filename: string, serpApiKey: string) {
  const violations = [];
  
  try {
    const searchUrl = `https://serpapi.com/search.json?engine=google&q=site:huggingface.co "${filename}"&api_key=${serpApiKey}&num=5`;
    
    const response = await fetch(searchUrl);
    
    if (response.ok) {
      const data = await response.json();
      const results = data.organic_results || [];

      for (const result of results) {
        if (result.link?.includes('huggingface.co/datasets')) {
          violations.push({
            type: 'found_in_huggingface_dataset',
            source_url: result.link,
            domain: 'huggingface.co',
            confidence: 0.85,
            evidence: {
              detection_method: 'huggingface_search',
              dataset_title: result.title,
              dataset_snippet: result.snippet,
              detection_timestamp: new Date().toISOString()
            }
          });
        }
      }
    }
  } catch (error) {
    console.error('Error searching HuggingFace:', error);
  }

  return violations;
}

// Use OpenAI to analyze if found image is a match
async function analyzeWithOpenAI(imageUrl: string, originalFilename: string, datasetName: string, apiKey: string) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI training dataset analyst. Analyze if an image found in ${datasetName} likely matches the user's original content "${originalFilename}". 
            Look for: visual similarity, potential derivatives, cropped versions, or modified copies.
            Respond ONLY with JSON: {"isMatch": boolean, "confidence": 0-1, "reasoning": "brief explanation"}`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: `Analyze if this image from ${datasetName} could be a copy/derivative of "${originalFilename}":` },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        max_tokens: 200,
        temperature: 0.1
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
  } catch (error) {
    console.error('OpenAI analysis error:', error);
  }

  return { isMatch: false, confidence: 0, reasoning: 'Analysis failed' };
}

// Analyze text match with OpenAI
async function analyzeTextMatch(originalText: string, foundSnippet: string, apiKey: string) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Analyze if the found text snippet indicates the original content was included in an AI training dataset.
            Look for: exact matches, paraphrases, or derivative content.
            Respond ONLY with JSON: {"isMatch": boolean, "confidence": 0-1, "reasoning": "brief explanation"}`
          },
          {
            role: 'user',
            content: `Original content excerpt: "${originalText}"\n\nFound in dataset: "${foundSnippet}"\n\nDoes this indicate the original content was used in AI training?`
          }
        ],
        max_tokens: 200,
        temperature: 0.1
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
  } catch (error) {
    console.error('OpenAI text analysis error:', error);
  }

  return { isMatch: false, confidence: 0, reasoning: 'Analysis failed' };
}

// Extract search terms from document
function extractSearchTerms(file: any) {
  const terms = [];
  
  // Use filename as a term
  if (file.original_filename) {
    const cleanName = file.original_filename.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');
    if (cleanName.length > 3) {
      terms.push(cleanName);
    }
  }
  
  // Use text fingerprint if available
  if (file.text_fingerprint) {
    terms.push(file.text_fingerprint.substring(0, 20));
  }
  
  // Extract from metadata if available
  if (file.metadata?.title) {
    terms.push(file.metadata.title);
  }
  
  if (file.metadata?.keywords) {
    terms.push(...(file.metadata.keywords || []));
  }

  return terms.filter(t => t && t.length > 3);
}
