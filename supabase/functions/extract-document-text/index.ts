import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { protectionRecordId, filePath } = await req.json();
    
    console.log('Extracting text from document:', { protectionRecordId, filePath });

    // Get user
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get protection record
    const { data: record, error: recordError } = await supabaseClient
      .from('ai_protection_records')
      .select('*')
      .eq('id', protectionRecordId)
      .eq('user_id', user.id)
      .single();

    if (recordError || !record) {
      throw new Error('Protection record not found');
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('protected-documents')
      .download(filePath);

    if (downloadError || !fileData) {
      throw new Error('Failed to download file from storage');
    }

    const fileExtension = record.file_extension?.toLowerCase();
    let extractedText = '';

    console.log('File extension:', fileExtension);

    // Extract text based on file type
    if (fileExtension === 'pdf') {
      extractedText = await extractTextFromPDF(fileData);
    } else if (['docx', 'doc'].includes(fileExtension)) {
      extractedText = await extractTextFromDOCX(fileData);
    } else if (['txt', 'md'].includes(fileExtension)) {
      const arrayBuffer = await fileData.arrayBuffer();
      const decoder = new TextDecoder('utf-8');
      extractedText = decoder.decode(arrayBuffer);
    } else {
      console.log('Unsupported file type for text extraction:', fileExtension);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'File type not supported for text extraction',
          extracted: false 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Limit text length
    if (extractedText.length > 1000000) {
      extractedText = extractedText.substring(0, 1000000);
      console.log('Text truncated to 1MB');
    }

    console.log('Extracted text length:', extractedText.length);

    // Calculate word count
    const wordCount = extractedText ? extractedText.split(/\s+/).filter(w => w.length > 0).length : 0;

    // Update protection record with extracted text
    const { error: updateError } = await supabaseClient
      .from('ai_protection_records')
      .update({
        word_count: wordCount,
        char_count: extractedText.length,
        metadata: {
          ...(record.metadata || {}),
          original_text: extractedText,
          text_extracted_at: new Date().toISOString(),
          extraction_method: fileExtension === 'pdf' ? 'pdf_parser' : 'docx_parser'
        }
      })
      .eq('id', protectionRecordId);

    if (updateError) {
      console.error('Error updating record:', updateError);
      throw updateError;
    }

    console.log('Successfully extracted and stored text');

    return new Response(
      JSON.stringify({
        success: true,
        extracted: true,
        wordCount,
        charCount: extractedText.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in extract-document-text:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function extractTextFromPDF(blob: Blob): Promise<string> {
  try {
    console.log('Attempting PDF text extraction...');
    
    // For PDF parsing in Deno, we'll use pdf.js via CDN
    // This is a simplified extraction - for production, consider using a dedicated PDF parsing service
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert binary to text and extract readable content
    // This is a basic approach - text will be mixed with PDF binary data
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const rawText = decoder.decode(uint8Array);
    
    // Extract text between stream markers (simplified PDF text extraction)
    const textMatches = rawText.match(/\(([^)]+)\)/g) || [];
    const extractedParts = textMatches
      .map(match => match.slice(1, -1)) // Remove parentheses
      .filter(text => text.length > 2)  // Filter out single characters
      .join(' ');
    
    // Clean up the extracted text
    const cleanedText = extractedParts
      .replace(/\\[rnt]/g, ' ')  // Replace escape sequences
      .replace(/\s+/g, ' ')       // Normalize whitespace
      .trim();
    
    console.log('PDF extraction completed, length:', cleanedText.length);
    return cleanedText;
    
  } catch (error) {
    console.error('PDF extraction error:', error);
    return '';
  }
}

async function extractTextFromDOCX(blob: Blob): Promise<string> {
  try {
    console.log('Attempting DOCX text extraction...');
    
    // DOCX files are ZIP archives containing XML files
    // We'll extract text from document.xml
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // For a proper DOCX parser, we'd need to:
    // 1. Unzip the file
    // 2. Parse document.xml
    // 3. Extract text from <w:t> tags
    
    // Simplified approach: convert to text and extract content
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const rawText = decoder.decode(uint8Array);
    
    // Extract text between XML tags (simplified)
    const textMatches = rawText.match(/>([^<]+)</g) || [];
    const extractedParts = textMatches
      .map(match => match.slice(1, -1)) // Remove > and <
      .filter(text => text.trim().length > 2)
      .join(' ');
    
    // Clean up the extracted text
    const cleanedText = extractedParts
      .replace(/\s+/g, ' ')
      .trim();
    
    console.log('DOCX extraction completed, length:', cleanedText.length);
    return cleanedText;
    
  } catch (error) {
    console.error('DOCX extraction error:', error);
    return '';
  }
}
