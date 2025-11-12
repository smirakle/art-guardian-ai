import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      throw new Error("URL parameter is required");
    }

    // Validate URL
    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch {
      throw new Error("Invalid URL format");
    }

    // Security: Only allow HTTP/HTTPS
    if (!['http:', 'https:'].includes(targetUrl.protocol)) {
      throw new Error("Only HTTP and HTTPS protocols are allowed");
    }

    console.log(`Fetching content from: ${url}`);

    // Fetch the document with timeout and size limit
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'TSMO-Document-Protection-Bot/1.0',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.status} ${response.statusText}`);
    }

    // Check content type
    const contentType = response.headers.get('content-type') || '';
    
    // Handle different content types
    let content = '';

    if (contentType.includes('text/html')) {
      const html = await response.text();
      // Strip HTML tags for basic text extraction
      content = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    } else if (contentType.includes('application/json')) {
      const json = await response.json();
      content = JSON.stringify(json, null, 2);
    } else if (
      contentType.includes('text/') || 
      contentType.includes('application/xml') ||
      contentType.includes('application/xhtml')
    ) {
      content = await response.text();
    } else if (contentType.includes('application/pdf')) {
      // For PDFs, we'd need a PDF parser - for now, return error message
      throw new Error(
        "PDF parsing not yet supported. Please use the text paste option instead, or extract text from the PDF manually."
      );
    } else if (
      contentType.includes('application/msword') ||
      contentType.includes('application/vnd.openxmlformats-officedocument')
    ) {
      throw new Error(
        "Word document parsing not yet supported. Please use the text paste option instead, or extract text from the document manually."
      );
    } else {
      throw new Error(
        `Unsupported content type: ${contentType}. Please paste the text content directly instead.`
      );
    }

    // Limit content size (max 1MB of text)
    if (content.length > 1000000) {
      content = content.substring(0, 1000000);
      console.log(`Content truncated to 1MB limit`);
    }

    if (!content || content.length < 50) {
      throw new Error(
        "Document contains insufficient text content for comparison (minimum 50 characters required)"
      );
    }

    console.log(`Successfully fetched ${content.length} characters from ${url}`);

    return new Response(
      JSON.stringify({ 
        content,
        metadata: {
          url,
          contentType,
          length: content.length,
          fetchedAt: new Date().toISOString()
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error: any) {
    console.error('Error fetching document content:', error);

    // Handle specific error types
    let errorMessage = error.message || 'Failed to fetch document content';
    let statusCode = 400;

    if (error.name === 'AbortError') {
      errorMessage = 'Request timeout - the document took too long to fetch (max 30 seconds)';
      statusCode = 408;
    } else if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Unable to access the URL. The site may be blocking automated requests or the URL may be incorrect.';
      statusCode = 502;
    }

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error.message 
      }),
      { 
        status: statusCode,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
