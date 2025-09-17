import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Key, CheckCircle } from "lucide-react";

const ApiKeySetup = () => {
  const apiKeys = [
    {
      name: "OpenAI API",
      secretName: "OPENAI_API_KEY",
      description: "🔥 Primary AI-powered image analysis - REQUIRED for core functionality",
      url: "https://platform.openai.com/api-keys",
      required: true
    },
    {
      name: "TinEye API",
      secretName: "TINEYE_API_KEY",
      description: "Enhanced reverse image search capabilities (optional)",
      url: "https://services.tineye.com/developers",
      additionalSecret: "TINEYE_API_SECRET"
    },
    {
      name: "Bing Visual Search API",
      secretName: "BING_VISUAL_SEARCH_API_KEY",
      description: "Additional reverse image search coverage (optional)",
      url: "https://www.microsoft.com/en-us/bing/apis/bing-visual-search-api"
    },
    {
      name: "SerpAPI",
      secretName: "SERPAPI_KEY",
      description: "Multi-engine search for comprehensive coverage (optional)",
      url: "https://serpapi.com/"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">API Setup Required</h2>
        <p className="text-muted-foreground">
          To enable real reverse image search, you'll need to configure these API keys in your Supabase Edge Function Secrets.
        </p>
      </div>

      <div className="grid gap-4">
        {apiKeys.map((api, index) => (
          <Card key={index} className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Key className="w-5 h-5" />
                {api.name}
              </CardTitle>
              <CardDescription>{api.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  {api.secretName}
                </code>
                {api.additionalSecret && (
                  <>
                    <span>+</span>
                    <code className="bg-muted px-2 py-1 rounded text-xs">
                      {api.additionalSecret}
                    </code>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full"
              >
                <a
                  href={api.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  Get API Key
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <CheckCircle className="w-5 h-5" />
            Setup Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="text-green-700 dark:text-green-300">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Get API keys from the providers above</li>
            <li>Go to your Supabase Dashboard → Settings → Edge Functions</li>
            <li>Add each API key as a secret with the exact name shown</li>
            <li>Deploy the edge functions (automatic with Lovable)</li>
            <li>Test the copyright detection system</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeySetup;