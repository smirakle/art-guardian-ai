import { createHmac } from "node:crypto";
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_KEY = Deno.env.get("TWITTER_CONSUMER_KEY")?.trim();
const API_SECRET = Deno.env.get("TWITTER_CONSUMER_SECRET")?.trim();
const ACCESS_TOKEN = Deno.env.get("TWITTER_ACCESS_TOKEN")?.trim();
const ACCESS_TOKEN_SECRET = Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET")?.trim();

function validateEnvironmentVariables() {
  const missing = [];
  if (!API_KEY) missing.push("TWITTER_CONSUMER_KEY");
  if (!API_SECRET) missing.push("TWITTER_CONSUMER_SECRET");
  if (!ACCESS_TOKEN) missing.push("TWITTER_ACCESS_TOKEN");
  if (!ACCESS_TOKEN_SECRET) missing.push("TWITTER_ACCESS_TOKEN_SECRET");
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }
}

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const normalizedParams = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .sort()
    .join("&");

  const signatureBaseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(normalizedParams)}`;
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;

  const hmacSha1 = createHmac("sha1", signingKey);
  const signature = hmacSha1.update(signatureBaseString).digest("base64");

  console.log("OAuth signature base string:", signatureBaseString);

  return signature;
}

function generateOAuthHeader(method: string, url: string): string {
  const oauthParams = {
    oauth_consumer_key: API_KEY!,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: ACCESS_TOKEN!,
    oauth_version: "1.0",
  };

  const signature = generateOAuthSignature(
    method,
    url,
    oauthParams,
    API_SECRET!,
    ACCESS_TOKEN_SECRET!
  );

  const signedOAuthParams = {
    ...oauthParams,
    oauth_signature: signature,
  };

  const entries = Object.entries(signedOAuthParams).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  return (
    "OAuth " +
    entries
      .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
      .join(", ")
  );
}

const BASE_URL = "https://api.x.com/2";

async function twitterRequest(method: string, path: string, body?: unknown) {
  const url = `${BASE_URL}${path}`;
  const oauthHeader = generateOAuthHeader(method, url);

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: oauthHeader,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const responseText = await response.text();
  console.log(`Twitter API ${method} ${path} status:`, response.status);

  if (!response.ok) {
    console.error("Twitter API error:", responseText);
    throw new Error(`Twitter API error: ${response.status} - ${responseText}`);
  }

  return responseText ? JSON.parse(responseText) : null;
}

async function verifyCredentials() {
  return twitterRequest("GET", "/users/me");
}

async function sendTweet(tweetText: string): Promise<any> {
  console.log("Sending tweet:", tweetText.substring(0, 50) + "...");
  return twitterRequest("POST", "/tweets", { text: tweetText });
}

function buildTweetText(
  title: string,
  excerpt: string | null,
  url: string | null,
  hashtags: string[],
  mentions: string[]
): string {
  let tweetText = `📝 New Blog Post: ${title}`;
  
  if (excerpt) {
    const maxExcerptLength = 100;
    const truncatedExcerpt = excerpt.length > maxExcerptLength 
      ? excerpt.substring(0, maxExcerptLength - 3) + "..."
      : excerpt;
    tweetText += `\n\n${truncatedExcerpt}`;
  }
  
  if (url) {
    tweetText += `\n\n${url}`;
  }
  
  if (hashtags && hashtags.length > 0) {
    tweetText += `\n\n${hashtags.join(' ')}`;
  }
  
  if (mentions && mentions.length > 0) {
    tweetText += `\n\ncc ${mentions.join(' ')}`;
  }

  // Ensure tweet is within character limit
  if (tweetText.length > 280) {
    tweetText = tweetText.substring(0, 277) + "...";
  }
  
  return tweetText;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    validateEnvironmentVariables();
    
    const { title, excerpt, url, blogPostId, hashtags = [], mentions = [] } = await req.json();
    
    if (!title) {
      throw new Error("Title is required");
    }

    const tweetText = buildTweetText(title, excerpt, url, hashtags, mentions);

    console.log("Final tweet text:", tweetText);
    console.log("Character count:", tweetText.length);

    // Verify credentials before attempting to tweet
    await verifyCredentials();

    const tweetResult = await sendTweet(tweetText);
    console.log("Tweet posted successfully:", tweetResult);

    // Update blog post with twitter post id if blogPostId provided
    if (blogPostId && tweetResult.data?.id) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await supabase
        .from('blog_posts')
        .update({ 
          social_media_posted: true,
          twitter_post_id: tweetResult.data.id 
        })
        .eq('id', blogPostId);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      tweet: tweetResult,
      tweetId: tweetResult.data?.id,
      tweetText: tweetText
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Error posting to Twitter:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
