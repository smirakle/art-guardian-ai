

# Build MCP Server Edge Function

## Summary
Create a Supabase Edge Function (`mcp-server`) using `mcp-lite` and Hono that exposes four core platform tools via the Model Context Protocol, enabling AI agents (Claude, Cursor, Windsurf) to call them directly.

## Exposed Tools

| Tool | Description | Delegates to |
|------|-------------|-------------|
| `image_scan` | Scan an image URL for copyright infringement across the web | `production-realtime-scanner` |
| `social_media_monitor` | Monitor social media platforms for unauthorized use | `real-social-media-monitor` |
| `deepfake_detection` | Analyze an image for deepfake/AI manipulation | `deepfake-detection` |
| `dmca_filing` | File an automated DMCA takedown notice | `automated-dmca-filing` |

## Architecture

```text
AI Agent (Claude, Cursor, etc.)
  │
  ▼  POST /mcp-server (MCP Streamable HTTP)
┌──────────────────────────┐
│  mcp-server (Edge Fn)    │
│  - Hono router           │
│  - mcp-lite McpServer    │
│  - Auth via Bearer token │
│  - 4 tool definitions    │
└──────┬───────────────────┘
       │ supabase.functions.invoke()
       ▼
  Existing Edge Functions
```

## Changes

### 1. Create `supabase/functions/mcp-server/index.ts`
- Import Hono + mcp-lite (`npm:mcp-lite@^0.10.0`)
- Authenticate incoming requests via the `Authorization` header (validate JWT with Supabase)
- Register four tools with input schemas (JSON Schema)
- Each tool handler invokes the corresponding existing edge function using the service role key
- Route all requests through `StreamableHttpTransport`

### 2. Create `supabase/functions/mcp-server/deno.json`
- Define import map for `mcp-lite` and `hono`

### 3. Update `supabase/config.toml`
- Add `[functions.mcp-server]` with `verify_jwt = false` (auth handled in code for MCP protocol compatibility)

## MCP Server URL (after deploy)
```
https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/mcp-server
```

Users configure this URL in their AI agent's MCP settings with their Supabase auth token as the Bearer token.

## Tool Input Schemas

- **image_scan**: `{ imageUrl: string, platforms?: string[], priority?: "low"|"normal"|"high" }`
- **social_media_monitor**: `{ accountId: string, scanType?: "full"|"quick" }`
- **deepfake_detection**: `{ filePath: string, fileName: string, artworkId?: string }`
- **dmca_filing**: `{ matchId: string, autoFile?: boolean }`

## Files to create/modify
- `supabase/functions/mcp-server/index.ts` (new)
- `supabase/functions/mcp-server/deno.json` (new)
- `supabase/config.toml` (add entry)

