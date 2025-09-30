import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Play, Copy, Check, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_ENDPOINTS = [
  {
    name: 'Scan Content',
    method: 'POST',
    path: '/v1/scan',
    description: 'Scan an image or text for copyright violations',
    example: {
      content_url: 'https://example.com/image.jpg',
      content_type: 'image',
      options: {
        deep_scan: true,
        check_ai_training: true
      }
    }
  },
  {
    name: 'Setup Monitoring',
    method: 'POST',
    path: '/v1/monitor',
    description: 'Set up continuous monitoring for URLs',
    example: {
      target_urls: ['https://example.com/page1', 'https://example.com/page2'],
      scan_frequency: 'daily',
      notification_webhook: 'https://your-domain.com/webhook'
    }
  },
  {
    name: 'Get Results',
    method: 'GET',
    path: '/v1/results?scan_id={scan_id}',
    description: 'Retrieve scan or monitoring results',
    example: {}
  },
  {
    name: 'Analytics',
    method: 'GET',
    path: '/v1/analytics',
    description: 'Get API usage analytics and metrics',
    example: {}
  }
];

export const APIDocumentationPlayground: React.FC = () => {
  const { toast } = useToast();
  const [selectedEndpoint, setSelectedEndpoint] = useState(API_ENDPOINTS[0]);
  const [apiKey, setApiKey] = useState('');
  const [requestBody, setRequestBody] = useState(JSON.stringify(selectedEndpoint.example, null, 2));
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleEndpointChange = (endpoint: typeof API_ENDPOINTS[0]) => {
    setSelectedEndpoint(endpoint);
    setRequestBody(JSON.stringify(endpoint.example, null, 2));
    setResponse('');
  };

  const handleTryIt = async () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your API key to test the endpoint",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const baseUrl = `https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/enterprise-api-v1`;
      const url = `${baseUrl}${selectedEndpoint.path}`;
      
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        }
      };

      if (selectedEndpoint.method === 'POST') {
        options.body = requestBody;
      }

      const res = await fetch(url, options);
      const data = await res.json();
      
      setResponse(JSON.stringify(data, null, 2));
      
      toast({
        title: "Request Successful",
        description: `Status: ${res.status} ${res.statusText}`,
      });
    } catch (error) {
      setResponse(JSON.stringify({ error: String(error) }, null, 2));
      toast({
        title: "Request Failed",
        description: "Check the response panel for details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied to clipboard",
      description: "Code snippet copied successfully",
    });
  };

  const generateCurlCommand = () => {
    const baseUrl = `https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/enterprise-api-v1`;
    const url = `${baseUrl}${selectedEndpoint.path}`;
    
    if (selectedEndpoint.method === 'GET') {
      return `curl -X GET "${url}" \\
  -H "x-api-key: YOUR_API_KEY"`;
    }
    
    return `curl -X POST "${url}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '${requestBody}'`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            API Documentation & Playground
          </CardTitle>
          <CardDescription>
            Interactive API documentation with live testing capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="playground" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="playground">Playground</TabsTrigger>
              <TabsTrigger value="documentation">Documentation</TabsTrigger>
              <TabsTrigger value="code">Code Examples</TabsTrigger>
            </TabsList>

            <TabsContent value="playground" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Select Endpoint</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {API_ENDPOINTS.map((endpoint) => (
                      <Button
                        key={endpoint.path}
                        variant={selectedEndpoint.path === endpoint.path ? 'default' : 'outline'}
                        className="justify-start"
                        onClick={() => handleEndpointChange(endpoint)}
                      >
                        <Code className="h-4 w-4 mr-2" />
                        {endpoint.method} {endpoint.path}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="Enter your API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>

                {selectedEndpoint.method === 'POST' && (
                  <div>
                    <Label htmlFor="request-body">Request Body</Label>
                    <Textarea
                      id="request-body"
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      className="font-mono text-sm h-48"
                    />
                  </div>
                )}

                <Button onClick={handleTryIt} disabled={loading} className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  {loading ? 'Testing...' : 'Try It'}
                </Button>

                {response && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Response</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(response)}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Textarea
                      value={response}
                      readOnly
                      className="font-mono text-sm h-64 bg-muted"
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="documentation" className="space-y-6">
              {API_ENDPOINTS.map((endpoint) => (
                <Card key={endpoint.path}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs font-mono bg-primary/10 rounded">
                        {endpoint.method}
                      </span>
                      <code className="text-sm">{endpoint.path}</code>
                    </div>
                    <CardDescription>{endpoint.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Authentication</h4>
                        <p className="text-sm text-muted-foreground">
                          Include your API key in the <code>x-api-key</code> header
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Rate Limits</h4>
                        <p className="text-sm text-muted-foreground">
                          1000 requests per hour per API key
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="code" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>cURL Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                      <code>{generateCurlCommand()}</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(generateCurlCommand())}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>JavaScript Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                      <code>{`const response = await fetch('${selectedEndpoint.path}', {
  method: '${selectedEndpoint.method}',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_API_KEY'
  },
  body: JSON.stringify(${JSON.stringify(selectedEndpoint.example, null, 2)})
});

const data = await response.json();
console.log(data);`}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
