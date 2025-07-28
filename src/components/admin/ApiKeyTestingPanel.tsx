import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ApiKeyStatus {
  name: string;
  status: 'unknown' | 'working' | 'error' | 'testing';
  hasKey: boolean;
  error?: string;
  details?: any;
}

const ApiKeyTestingPanel: React.FC = () => {
  const [apiStatuses, setApiStatuses] = useState<ApiKeyStatus[]>([
    { name: 'Google Custom Search', status: 'unknown', hasKey: false },
    { name: 'Bing Visual Search', status: 'unknown', hasKey: false },
    { name: 'TinEye', status: 'unknown', hasKey: false },
    { name: 'SerpAPI', status: 'unknown', hasKey: false },
    { name: 'OpenAI', status: 'unknown', hasKey: false },
    { name: 'YouTube API', status: 'unknown', hasKey: false }
  ]);
  
  const [isTestingAll, setIsTestingAll] = useState(false);

  const testApiKeys = async () => {
    setIsTestingAll(true);
    
    // Set all to testing state
    setApiStatuses(prev => prev.map(api => ({ ...api, status: 'testing' as const })));

    try {
      const { data, error } = await supabase.functions.invoke('real-image-search', {
        body: {
          checkApiKeys: true,
          testMode: true
        }
      });

      if (error) {
        throw error;
      }

      if (data?.apiStatus) {
        const updatedStatuses: ApiKeyStatus[] = [
          {
            name: 'Google Custom Search',
            status: data.apiStatus.google?.working ? 'working' as const : 'error' as const,
            hasKey: !!(data.apiStatus.google?.api_key && data.apiStatus.google?.search_engine_id),
            error: data.apiStatus.google?.error,
            details: data.apiStatus.google
          },
          {
            name: 'Bing Visual Search',
            status: data.apiStatus.bing?.working ? 'working' as const : 'error' as const,
            hasKey: !!data.apiStatus.bing?.api_key,
            error: data.apiStatus.bing?.error,
            details: data.apiStatus.bing
          },
          {
            name: 'TinEye',
            status: data.apiStatus.tineye?.working ? 'working' as const : 'error' as const,
            hasKey: !!(data.apiStatus.tineye?.api_key && data.apiStatus.tineye?.api_secret),
            error: data.apiStatus.tineye?.error,
            details: data.apiStatus.tineye
          },
          {
            name: 'SerpAPI',
            status: data.apiStatus.serpapi?.working ? 'working' as const : 'error' as const,
            hasKey: !!data.apiStatus.serpapi?.api_key,
            error: data.apiStatus.serpapi?.error,
            details: data.apiStatus.serpapi
          },
          {
            name: 'OpenAI',
            status: data.apiStatus.openai?.working ? 'working' as const : 'error' as const,
            hasKey: !!data.apiStatus.openai?.api_key,
            error: data.apiStatus.openai?.error,
            details: data.apiStatus.openai
          },
          {
            name: 'YouTube API',
            status: 'unknown' as const,
            hasKey: false,
            error: 'Not tested in this function'
          }
        ];
        
        setApiStatuses(updatedStatuses);
      }
    } catch (error) {
      console.error('Error testing API keys:', error);
      setApiStatuses(prev => prev.map(api => ({ 
        ...api, 
        status: 'error' as const, 
        error: 'Failed to test API keys' 
      })));
    }

    setIsTestingAll(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'working':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'testing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (api: ApiKeyStatus) => {
    if (api.status === 'testing') {
      return <Badge variant="outline">Testing...</Badge>;
    }
    if (!api.hasKey) {
      return <Badge variant="destructive">No Key</Badge>;
    }
    if (api.status === 'working') {
      return <Badge variant="default" className="bg-green-500">Working</Badge>;
    }
    if (api.status === 'error') {
      return <Badge variant="destructive">Error</Badge>;
    }
    return <Badge variant="secondary">Unknown</Badge>;
  };

  const workingCount = apiStatuses.filter(api => api.status === 'working').length;
  const totalCount = apiStatuses.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Key Testing</h2>
          <p className="text-muted-foreground">
            Test the functionality of configured API keys for reverse image search
          </p>
        </div>
        <Button onClick={testApiKeys} disabled={isTestingAll}>
          {isTestingAll ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Test All APIs
            </>
          )}
        </Button>
      </div>

      <Alert>
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>
          {workingCount}/{totalCount} APIs are currently working. 
          {workingCount === 0 && " No working APIs will result in 0 matches from emergency scans."}
          {workingCount < 3 && workingCount > 0 && " Limited APIs may reduce scan effectiveness."}
          {workingCount >= 3 && " Good API coverage for effective scanning."}
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {apiStatuses.map((api, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(api.status)}
                  <CardTitle className="text-lg">{api.name}</CardTitle>
                </div>
                {getStatusBadge(api)}
              </div>
            </CardHeader>
            <CardContent>
              {api.error && (
                <Alert variant="destructive" className="mb-3">
                  <AlertDescription>{api.error}</AlertDescription>
                </Alert>
              )}
              
              {api.details && (
                <div className="text-sm text-muted-foreground space-y-1">
                  {api.details.api_key !== undefined && (
                    <div>API Key: {api.details.api_key ? '✓ Present' : '✗ Missing'}</div>
                  )}
                  {api.details.search_engine_id !== undefined && (
                    <div>Search Engine ID: {api.details.search_engine_id ? '✓ Present' : '✗ Missing'}</div>
                  )}
                  {api.details.api_secret !== undefined && (
                    <div>API Secret: {api.details.api_secret ? '✓ Present' : '✗ Missing'}</div>
                  )}
                  {api.details.quota && (
                    <div>Quota Status: {api.details.quota}</div>
                  )}
                  {api.details.response_time && (
                    <div>Response Time: {api.details.response_time}ms</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Alert>
        <AlertDescription>
          <strong>How to fix issues:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Missing keys: Add the required API keys in Supabase Edge Function Secrets</li>
            <li>Quota exceeded: Check your API provider's dashboard for usage limits</li>
            <li>Invalid keys: Verify the API keys are correct and haven't expired</li>
            <li>Rate limits: APIs may temporarily block requests if rate limited</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ApiKeyTestingPanel;