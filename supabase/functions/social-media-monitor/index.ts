import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { accountId, scanType = 'full' } = await req.json();

    if (!accountId) {
      throw new Error('Account ID is required');
    }

    console.log(`Starting social media monitoring for account: ${accountId}, type: ${scanType}`);

    // Get account details
    const { data: account, error: accountError } = await supabase
      .from('social_media_accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (accountError) {
      throw new Error(`Failed to fetch account: ${accountError.message}`);
    }

    console.log(`Monitoring account: @${account.account_handle} on ${account.platform}`);

    // Create scan record
    const { data: scan, error: scanError } = await supabase
      .from('social_media_scans')
      .insert({
        account_id: accountId,
        scan_type: scanType,
        status: 'running',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (scanError) {
      throw new Error(`Failed to create scan record: ${scanError.message}`);
    }

    console.log(`Created scan record: ${scan.id}`);

    // Simulate account verification and content scanning
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update account verification status
    await supabase
      .from('social_media_accounts')
      .update({ 
        verification_status: 'verified',
        last_scan_at: new Date().toISOString()
      })
      .eq('id', accountId);

    // Simulate content discovery and analysis
    const mockContentResults = await performContentAnalysis(account, scan.id, supabase);

    // Update scan completion
    await supabase
      .from('social_media_scans')
      .update({
        status: 'completed',
        content_scanned: mockContentResults.contentScanned,
        detections_found: mockContentResults.detectionsCount,
        completed_at: new Date().toISOString()
      })
      .eq('id', scan.id);

    console.log(`Scan completed: ${mockContentResults.contentScanned} items scanned, ${mockContentResults.detectionsCount} detections found`);

    return new Response(JSON.stringify({
      success: true,
      scanId: scan.id,
      accountHandle: account.account_handle,
      platform: account.platform,
      contentScanned: mockContentResults.contentScanned,
      detectionsFound: mockContentResults.detectionsCount,
      detections: mockContentResults.detections
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Social media monitoring error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function performContentAnalysis(account: any, scanId: string, supabase: any) {
  const contentTypes = ['video', 'image', 'post', 'story'];
  const detectionTypes = ['deepfake', 'copyright', 'impersonation'];
  const threatLevels = ['low', 'medium', 'high'];
  
  // Simulate scanning different amounts of content based on platform
  const contentCounts = {
    youtube: Math.floor(Math.random() * 50) + 20,
    facebook: Math.floor(Math.random() * 80) + 30,
    instagram: Math.floor(Math.random() * 100) + 40,
    tiktok: Math.floor(Math.random() * 150) + 60
  };

  const contentScanned = contentCounts[account.platform as keyof typeof contentCounts] || 50;
  const detections = [];
  
  // Generate realistic detection results (10-20% detection rate)
  const detectionRate = 0.1 + Math.random() * 0.1;
  const detectionsCount = Math.floor(contentScanned * detectionRate);

  console.log(`Analyzing ${contentScanned} pieces of content from @${account.account_handle}`);

  for (let i = 0; i < detectionsCount; i++) {
    const contentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
    const detectionType = detectionTypes[Math.floor(Math.random() * detectionTypes.length)];
    const threatLevel = threatLevels[Math.floor(Math.random() * threatLevels.length)];
    const confidence = 0.6 + Math.random() * 0.4; // 60-100% confidence

    // Generate realistic artifacts based on detection type
    const artifacts = generateArtifacts(detectionType);
    
    // Create detection record
    const detection = {
      account_id: account.id,
      scan_id: scanId,
      content_type: contentType,
      content_url: generateContentUrl(account, contentType, i),
      content_title: generateContentTitle(account.platform, contentType, i),
      content_description: generateContentDescription(detectionType, confidence),
      thumbnail_url: generateThumbnailUrl(account.platform, i),
      detection_type: detectionType,
      confidence_score: confidence,
      threat_level: threatLevel,
      artifacts_detected: artifacts,
      detected_at: new Date().toISOString()
    };

    // Insert detection into database
    const { error: detectionError } = await supabase
      .from('social_media_monitoring_results')
      .insert(detection);

    if (detectionError) {
      console.error('Error inserting detection:', detectionError);
    } else {
      detections.push(detection);
      console.log(`Detected ${detectionType} in ${contentType} with ${Math.round(confidence * 100)}% confidence`);
    }

    // Add delay to simulate real-time processing
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return {
    contentScanned,
    detectionsCount,
    detections
  };
}

function generateArtifacts(detectionType: string): string[] {
  const artifactSets = {
    deepfake: [
      'Facial landmark inconsistencies',
      'Temporal flickering',
      'Unnatural eye movements',
      'Inconsistent lighting',
      'Audio-visual synchronization issues',
      'Compression artifacts',
      'Edge artifacts around face'
    ],
    copyright: [
      'Watermark removal traces',
      'Metadata inconsistencies',
      'Resolution mismatches',
      'Color profile differences',
      'EXIF data manipulation',
      'Reverse image match found'
    ],
    impersonation: [
      'Profile verification mismatch',
      'Account creation date suspicious',
      'Follower pattern anomalies',
      'Content similarity detected',
      'Username variations',
      'Bio content duplication'
    ]
  };

  const availableArtifacts = artifactSets[detectionType as keyof typeof artifactSets] || [];
  const numArtifacts = Math.floor(Math.random() * 3) + 1; // 1-3 artifacts
  
  return availableArtifacts
    .sort(() => Math.random() - 0.5)
    .slice(0, numArtifacts);
}

function generateContentUrl(account: any, contentType: string, index: number): string {
  const baseUrls = {
    youtube: `https://www.youtube.com/watch?v=${generateRandomId()}`,
    facebook: `https://www.facebook.com/${account.account_handle}/posts/${generateRandomId()}`,
    instagram: `https://www.instagram.com/p/${generateRandomId()}/`,
    tiktok: `https://www.tiktok.com/@${account.account_handle}/video/${generateRandomId()}`
  };

  return baseUrls[account.platform as keyof typeof baseUrls] || `${account.account_url}/content/${index}`;
}

function generateContentTitle(platform: string, contentType: string, index: number): string {
  const titles = {
    youtube: [
      'Latest Music Video Release',
      'Behind the Scenes Content',
      'Live Performance Highlights',
      'Interview Segment',
      'Music Production Process'
    ],
    facebook: [
      'New Photo Album',
      'Live Video Update',
      'Event Announcement',
      'Personal Update',
      'Shared Content'
    ],
    instagram: [
      'Instagram Story Highlight',
      'Photo Post',
      'Reel Content',
      'IGTV Video',
      'Live Stream Archive'
    ],
    tiktok: [
      'Trending Challenge Video',
      'Original Content',
      'Duet Response',
      'Music Performance',
      'Creative Short'
    ]
  };

  const platformTitles = titles[platform as keyof typeof titles] || ['Content Post'];
  return platformTitles[index % platformTitles.length];
}

function generateContentDescription(detectionType: string, confidence: number): string {
  const descriptions = {
    deepfake: `AI-generated face replacement detected with ${Math.round(confidence * 100)}% confidence. Advanced neural analysis identified synthetic facial features and temporal inconsistencies.`,
    copyright: `Potential copyright infringement detected with ${Math.round(confidence * 100)}% confidence. Content analysis suggests unauthorized use of protected material.`,
    impersonation: `Account impersonation detected with ${Math.round(confidence * 100)}% confidence. Profile analysis indicates potential identity theft or unauthorized representation.`
  };

  return descriptions[detectionType as keyof typeof descriptions] || 'Suspicious content detected';
}

function generateThumbnailUrl(platform: string, index: number): string {
  // Generate placeholder thumbnail URLs
  const thumbnails = [
    'https://picsum.photos/320/180?random=1',
    'https://picsum.photos/320/180?random=2',
    'https://picsum.photos/320/180?random=3',
    'https://picsum.photos/320/180?random=4',
    'https://picsum.photos/320/180?random=5'
  ];

  return thumbnails[index % thumbnails.length];
}

function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 15);
}