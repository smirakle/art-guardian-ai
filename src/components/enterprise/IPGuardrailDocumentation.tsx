import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Shield, Code, Zap, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function IPGuardrailDocumentation() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const curlExample = `curl -X POST https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/ip-guardrail \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "title": "Official Brand Logo Collection",
    "image_hash": "a1b2c3d4e5f6789012345678",
    "text_fingerprint": "brand_official_exclusive_2024"
  }'`;

  const responseExample = `{
  "decision": "block",
  "risk_score": 85.0,
  "signals": {
    "image_hash_present": true,
    "text_fingerprint_present": true,
    "title_keyword_match": true
  },
  "guidance": "Block upload and request proof of ownership/license."
}`;

  const jsExample = `// Example integration for platforms
const checkIPRisk = async (uploadData) => {
  const response = await fetch('https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/ip-guardrail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'YOUR_API_KEY'
    },
    body: JSON.stringify({
      title: uploadData.title,
      image_hash: uploadData.imageHash,
      text_fingerprint: uploadData.textFingerprint
    })
  });
  
  const result = await response.json();
  
  switch (result.decision) {
    case 'block':
      // Prevent upload, show IP notice
      showIPWarning(result.guidance);
      return false;
    case 'review':
      // Queue for manual review
      queueForReview(uploadData, result);
      return true;
    case 'allow':
      // Proceed with upload
      return true;
  }
};`;

  const pythonExample = `import requests

def check_ip_guardrail(title, image_hash=None, text_fingerprint=None):
    url = "https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/ip-guardrail"
    headers = {
        "Content-Type": "application/json",
        "x-api-key": "YOUR_API_KEY"
    }
    payload = {
        "title": title,
        "image_hash": image_hash,
        "text_fingerprint": text_fingerprint
    }
    
    response = requests.post(url, json=payload, headers=headers)
    return response.json()

# Example usage
result = check_ip_guardrail(
    title="Nike Air Jordan Official",
    image_hash="abc123def456",
    text_fingerprint="nike_official_jordan_2024"
)

print(f"Decision: {result['decision']}")
print(f"Risk Score: {result['risk_score']}%")`;

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            IP Guardrail API Documentation
          </CardTitle>
          <CardDescription>
            Partner API for pre-upload IP risk assessment - prevent infringement before it happens
          </CardDescription>
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Live Beta
            </Badge>
            <Badge variant="outline">
              REST API
            </Badge>
            <Badge variant="outline">
              Enterprise Only
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Alert className="border-amber-200 bg-amber-50">
        <Zap className="h-4 w-4" />
        <AlertDescription>
          <strong>Uniquely Ownable Feature:</strong> The only pre-upload IP risk assessment API that combines perceptual hashing, 
          text fingerprinting, and AI-powered risk scoring to prevent infringement before content goes live.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="authentication">Auth</TabsTrigger>
          <TabsTrigger value="endpoint">Endpoint</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>What is IP Guardrail?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                IP Guardrail is a real-time API that analyzes content before upload to detect potential intellectual property risks. 
                Perfect for UGC platforms, marketplaces, and content management systems.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Real-time Analysis
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Sub-second response times for instant upload decisions
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    Multi-signal Detection
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Combines image hashing, text analysis, and metadata checks
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-orange-500" />
                    Smart Decisions
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Returns allow/review/block with confidence scoring
                  </p>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Use Cases</h4>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  <li>E-commerce platforms preventing counterfeit listings</li>
                  <li>Social media platforms blocking copyrighted content</li>
                  <li>Stock photo sites ensuring original content</li>
                  <li>NFT marketplaces verifying ownership</li>
                  <li>Content management systems with IP compliance</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authentication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>Enterprise API keys required for access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Contact our enterprise sales team to obtain API keys: <strong>shirleena.cunningham@tsmowatch.com</strong>
                </AlertDescription>
              </Alert>
              
              <div className="space-y-3">
                <h4 className="font-semibold">API Key Header</h4>
                <div className="bg-muted p-3 rounded-lg font-mono text-sm relative">
                  <code>x-api-key: tsmo_your_enterprise_key_here</code>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard('x-api-key: tsmo_your_enterprise_key_here', 'auth')}
                  >
                    {copiedSection === 'auth' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Rate Limits</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">Standard</div>
                    <div className="text-muted-foreground">1,000 requests/hour</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">Enterprise</div>
                    <div className="text-muted-foreground">10,000 requests/hour</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoint" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoint</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-100 text-green-800">POST</Badge>
                  <code className="bg-muted px-2 py-1 rounded text-sm">
                    /functions/v1/ip-guardrail
                  </code>
                </div>
                
                <h4 className="font-semibold">Request Body</h4>
                <div className="bg-muted p-3 rounded-lg">
                  <pre className="text-sm font-mono">{`{
  "title": "string (required)",
  "image_hash": "string (optional)",  
  "text_fingerprint": "string (optional)"
}`}</pre>
                </div>

                <h4 className="font-semibold">Response</h4>
                <div className="bg-muted p-3 rounded-lg relative">
                  <pre className="text-sm font-mono">{responseExample}</pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(responseExample, 'response')}
                  >
                    {copiedSection === 'response' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium text-red-600">block</div>
                    <div className="text-muted-foreground">High risk, prevent upload</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium text-orange-600">review</div>
                    <div className="text-muted-foreground">Medium risk, manual review</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium text-green-600">allow</div>
                    <div className="text-muted-foreground">Low risk, proceed</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Code Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="curl" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                </TabsList>

                <TabsContent value="curl" className="space-y-3">
                  <div className="bg-muted p-3 rounded-lg relative">
                    <pre className="text-sm font-mono whitespace-pre-wrap">{curlExample}</pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(curlExample, 'curl')}
                    >
                      {copiedSection === 'curl' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="javascript" className="space-y-3">
                  <div className="bg-muted p-3 rounded-lg relative">
                    <pre className="text-sm font-mono whitespace-pre-wrap">{jsExample}</pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(jsExample, 'js')}
                    >
                      {copiedSection === 'js' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="python" className="space-y-3">
                  <div className="bg-muted p-3 rounded-lg relative">
                    <pre className="text-sm font-mono whitespace-pre-wrap">{pythonExample}</pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(pythonExample, 'python')}
                    >
                      {copiedSection === 'python' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold">1. Obtain Enterprise API Key</h4>
                <p className="text-sm text-muted-foreground">
                  Contact our enterprise team to get your API key and discuss volume pricing.
                </p>
                <Button variant="outline" className="gap-2">
                  <Code className="h-4 w-4" />
                  Contact Enterprise Sales
                </Button>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">2. Implement Pre-Upload Check</h4>
                <p className="text-sm text-muted-foreground">
                  Add the API call before processing user uploads in your platform.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <strong>Tip:</strong> Generate perceptual hashes client-side for images to minimize server load.
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">3. Handle API Responses</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <strong>Block:</strong> Show IP warning, require proof of ownership
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <strong>Review:</strong> Queue for manual moderation
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <strong>Allow:</strong> Proceed with normal upload flow
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">4. Monitor & Optimize</h4>
                <p className="text-sm text-muted-foreground">
                  Track false positives and work with our team to tune the risk scoring for your platform.
                </p>
              </div>
            </CardContent>
          </Card>

          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Beta Partnership Program:</strong> Early partners get 50% off first year and dedicated support for integration.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle>Ready to Integrate?</CardTitle>
          <CardDescription>
            Join leading platforms using IP Guardrail to prevent infringement proactively
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button size="lg" className="gap-2">
              <Shield className="h-5 w-5" />
              Get Enterprise Access
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Code className="h-4 w-4" />
              View Full API Docs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}