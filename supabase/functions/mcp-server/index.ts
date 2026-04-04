import { Hono } from "hono";
import { McpServer, StreamableHttpTransport } from "mcp-lite";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const app = new Hono();

const mcpServer = new McpServer({
  name: "tsmo-mcp-server",
  version: "1.0.0",
});

// --- Tool definitions ---

mcpServer.tool({
  name: "image_scan",
  description:
    "Scan an image URL for copyright infringement across the web using reverse image search and AI analysis.",
  inputSchema: {
    type: "object" as const,
    properties: {
      imageUrl: { type: "string", description: "The public URL of the image to scan" },
      platforms: {
        type: "array",
        items: { type: "string" },
        description: "Optional list of platforms to scan (e.g. google, bing, yandex)",
      },
      priority: {
        type: "string",
        enum: ["low", "normal", "high"],
        description: "Scan priority level. Defaults to normal.",
      },
    },
    required: ["imageUrl"],
  },
  handler: async (args: Record<string, unknown>) => {
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await serviceClient.functions.invoke(
      "production-realtime-scanner",
      { body: args }
    );
    if (error) {
      return { content: [{ type: "text" as const, text: `Error: ${error.message}` }] };
    }
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  },
});

mcpServer.tool({
  name: "social_media_monitor",
  description:
    "Monitor social media platforms for unauthorized use of copyrighted content. Scans Instagram, YouTube, TikTok, and more.",
  inputSchema: {
    type: "object" as const,
    properties: {
      accountId: {
        type: "string",
        description: "The social media account ID to scan",
      },
      scanType: {
        type: "string",
        enum: ["full", "quick"],
        description: "Type of scan. Defaults to quick.",
      },
    },
    required: ["accountId"],
  },
  handler: async (args: Record<string, unknown>) => {
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await serviceClient.functions.invoke(
      "real-social-media-monitor",
      { body: args }
    );
    if (error) {
      return { content: [{ type: "text" as const, text: `Error: ${error.message}` }] };
    }
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  },
});

mcpServer.tool({
  name: "deepfake_detection",
  description:
    "Analyze an image for deepfake or AI-generated manipulation. Returns confidence scores and detection details.",
  inputSchema: {
    type: "object" as const,
    properties: {
      filePath: {
        type: "string",
        description: "Storage path of the file to analyze",
      },
      fileName: {
        type: "string",
        description: "Original filename of the image",
      },
      artworkId: {
        type: "string",
        description: "Optional artwork ID to link detection results",
      },
    },
    required: ["filePath", "fileName"],
  },
  handler: async (args: Record<string, unknown>) => {
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await serviceClient.functions.invoke(
      "deepfake-detection",
      { body: args }
    );
    if (error) {
      return { content: [{ type: "text" as const, text: `Error: ${error.message}` }] };
    }
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  },
});

mcpServer.tool({
  name: "dmca_filing",
  description:
    "File an automated DMCA takedown notice for a detected copyright match. Sends legally compliant notices to platform DMCA agents.",
  inputSchema: {
    type: "object" as const,
    properties: {
      matchId: {
        type: "string",
        description: "The copyright match ID to file a DMCA notice for",
      },
      autoFile: {
        type: "boolean",
        description:
          "If true, automatically sends the DMCA notice via email. If false, creates a draft. Defaults to false.",
      },
    },
    required: ["matchId"],
  },
  handler: async (args: Record<string, unknown>) => {
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await serviceClient.functions.invoke(
      "automated-dmca-filing",
      { body: args }
    );
    if (error) {
      return { content: [{ type: "text" as const, text: `Error: ${error.message}` }] };
    }
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  },
});

// --- Auth middleware & routing ---

const transport = new StreamableHttpTransport();

// CORS preflight
app.options("/*", (c) => {
  return c.text("ok", 200, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, accept",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  });
});

// Auth check — validate Bearer token via Supabase
app.use("/*", async (c, next) => {
  // Skip auth for OPTIONS (already handled) and GET (SSE/session info)
  if (c.req.method === "OPTIONS") return next();

  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized — Bearer token required" }, 401);
  }

  // Validate the JWT
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims) {
    return c.json({ error: "Unauthorized — invalid token" }, 401);
  }

  // Store user info for tool handlers if needed
  c.set("userId" as never, data.claims.sub as never);
  await next();
});

// Route all MCP traffic through the transport
app.all("/*", async (c) => {
  const response = await transport.handleRequest(c.req.raw, mcpServer);
  // Add CORS headers to MCP responses
  response.headers.set("Access-Control-Allow-Origin", "*");
  return response;
});

Deno.serve(app.fetch);
