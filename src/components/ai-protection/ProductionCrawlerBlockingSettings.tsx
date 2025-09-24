import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Check, 
  AlertTriangle, 
  Settings, 
  Globe, 
  FileText,
  Download,
  RefreshCw,
  Ban,
  Clock
} from 'lucide-react';
import { 
  CrawlerBlockingOptions, 
  productionCrawlerBlocking 
} from '@/lib/productionCrawlerBlocking';

export const ProductionCrawlerBlockingSettings: React.FC = () => {
  const { toast } = useToast();
  
  const [options, setOptions] = useState<CrawlerBlockingOptions>({
    blockingLevel: 'advanced',
    allowedCrawlers: ['googlebot', 'bingbot'],
    blockedCrawlers: [],
    rateLimit: {
      requestsPerMinute: 60,
      banDuration: 3600
    },
    userAgentBlocking: true,
    ipBlocking: true,
    realTimeBlocking: true,
    respectRobotsTxt: true,
    aiCrawlerBlocking: true
  });

  const [robotsTxt, setRobotsTxt] = useState('');
  const [aiTxt, setAiTxt] = useState('');
  const [securityHeaders, setSecurityHeaders] = useState<Record<string, string>>({});
  const [testUserAgent, setTestUserAgent] = useState('');
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    generateFiles();
  }, [options]);

  const generateFiles = () => {
    const newRobotsTxt = productionCrawlerBlocking.generateProductionRobotsTxt(options);
    const newAiTxt = productionCrawlerBlocking.generateProductionAiTxt(options);
    const newHeaders = productionCrawlerBlocking.generateSecurityHeaders(options);
    
    setRobotsTxt(newRobotsTxt);
    setAiTxt(newAiTxt);
    setSecurityHeaders(newHeaders);
  };

  const updateOptions = (key: keyof CrawlerBlockingOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const updateRateLimit = (key: keyof CrawlerBlockingOptions['rateLimit'], value: number) => {
    setOptions(prev => ({
      ...prev,
      rateLimit: { ...prev.rateLimit, [key]: value }
    }));
  };

  const testCrawlerDetection = async () => {
    if (!testUserAgent.trim()) {
      toast({
        title: "Test Required",
        description: "Please enter a user agent string to test.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await productionCrawlerBlocking.analyzeCrawlerRequest(
        testUserAgent,
        '192.168.1.1',
        '',
        { 'user-agent': testUserAgent },
        options
      );
      
      setTestResult(result);
      
      toast({
        title: "Test Complete",
        description: `Crawler ${result.blocked ? 'would be blocked' : 'would be allowed'}`,
        variant: result.blocked ? "destructive" : "default",
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to test crawler detection.",
        variant: "destructive",
      });
    }
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const addAllowedCrawler = () => {
    const crawler = prompt('Enter crawler name (e.g., googlebot):');
    if (crawler && crawler.trim()) {
      setOptions(prev => ({
        ...prev,
        allowedCrawlers: [...prev.allowedCrawlers, crawler.trim().toLowerCase()]
      }));
    }
  };

  const removeAllowedCrawler = (crawler: string) => {
    setOptions(prev => ({
      ...prev,
      allowedCrawlers: prev.allowedCrawlers.filter(c => c !== crawler)
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5" />
            Production Web Crawler Blocking
          </CardTitle>
          <p className="text-muted-foreground">
            Enterprise-grade crawler blocking with AI training prevention and real-time detection
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Blocking Level */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Blocking Configuration</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="blocking-level">Protection Level</Label>
                <select
                  id="blocking-level"
                  value={options.blockingLevel}
                  onChange={(e) => updateOptions('blockingLevel', e.target.value as any)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="basic">Basic - Block only critical threats</option>
                  <option value="advanced">Advanced - Block high and critical risks</option>
                  <option value="maximum">Maximum - Block all suspicious activity</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rate-requests">Requests per Minute</Label>
                  <Input
                    id="rate-requests"
                    type="number"
                    value={options.rateLimit.requestsPerMinute}
                    onChange={(e) => updateRateLimit('requestsPerMinute', parseInt(e.target.value))}
                    min="1"
                    max="1000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ban-duration">Ban Duration (seconds)</Label>
                  <Input
                    id="ban-duration"
                    type="number"
                    value={options.rateLimit.banDuration}
                    onChange={(e) => updateRateLimit('banDuration', parseInt(e.target.value))}
                    min="60"
                    max="86400"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Blocking Methods */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Blocking Methods</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ai-crawler-blocking">AI Crawler Blocking</Label>
                  <p className="text-sm text-muted-foreground">
                    Block known AI training and data collection crawlers
                  </p>
                </div>
                <Switch
                  id="ai-crawler-blocking"
                  checked={options.aiCrawlerBlocking}
                  onCheckedChange={(checked) => updateOptions('aiCrawlerBlocking', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="user-agent-blocking">User Agent Blocking</Label>
                  <p className="text-sm text-muted-foreground">
                    Block based on suspicious user agent patterns
                  </p>
                </div>
                <Switch
                  id="user-agent-blocking"
                  checked={options.userAgentBlocking}
                  onCheckedChange={(checked) => updateOptions('userAgentBlocking', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ip-blocking">IP Address Blocking</Label>
                  <p className="text-sm text-muted-foreground">
                    Block IPs that exceed rate limits or show suspicious behavior
                  </p>
                </div>
                <Switch
                  id="ip-blocking"
                  checked={options.ipBlocking}
                  onCheckedChange={(checked) => updateOptions('ipBlocking', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="real-time-blocking">Real-time Blocking</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable immediate blocking of detected threats
                  </p>
                </div>
                <Switch
                  id="real-time-blocking"
                  checked={options.realTimeBlocking}
                  onCheckedChange={(checked) => updateOptions('realTimeBlocking', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Allowed Crawlers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                <h3 className="text-lg font-semibold">Allowed Crawlers</h3>
              </div>
              <Button onClick={addAllowedCrawler} size="sm">
                Add Crawler
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {options.allowedCrawlers.map((crawler, index) => (
                <Badge key={index} variant="secondary" className="cursor-pointer">
                  {crawler}
                  <button
                    onClick={() => removeAllowedCrawler(crawler)}
                    className="ml-2 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Crawler Detection Test */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Test Crawler Detection</h3>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="test-user-agent">Test User Agent</Label>
                <Input
                  id="test-user-agent"
                  value={testUserAgent}
                  onChange={(e) => setTestUserAgent(e.target.value)}
                  placeholder="Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
                />
              </div>
              
              <Button onClick={testCrawlerDetection} className="w-full">
                Test Detection
              </Button>
              
              {testResult && (
                <Card className={`border ${testResult.blocked ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Result:</span>
                        <Badge variant={testResult.blocked ? "destructive" : "default"}>
                          {testResult.blocked ? "BLOCKED" : "ALLOWED"}
                        </Badge>
                      </div>
                      <div><strong>Crawler Type:</strong> {testResult.crawlerInfo?.crawlerType}</div>
                      <div><strong>Risk Level:</strong> {testResult.crawlerInfo?.riskLevel}</div>
                      <div><strong>Reason:</strong> {testResult.crawlerInfo?.blockingReason}</div>
                      {testResult.crawlerInfo?.recommendations && (
                        <div>
                          <strong>Recommendations:</strong>
                          <ul className="text-sm list-disc list-inside">
                            {testResult.crawlerInfo.recommendations.map((rec: string, i: number) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <Separator />

          {/* Generated Files */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Generated Protection Files</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">robots.txt</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={robotsTxt}
                    readOnly
                    rows={8}
                    className="font-mono text-xs"
                  />
                  <Button
                    onClick={() => downloadFile(robotsTxt, 'robots.txt')}
                    size="sm"
                    className="mt-2 w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download robots.txt
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">ai.txt</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={aiTxt}
                    readOnly
                    rows={8}
                    className="font-mono text-xs"
                  />
                  <Button
                    onClick={() => downloadFile(aiTxt, 'ai.txt')}
                    size="sm"
                    className="mt-2 w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download ai.txt
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Security Headers */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Security Headers</h3>
            </div>
            
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-2 font-mono text-sm">
                  {Object.entries(securityHeaders).map(([header, value]) => (
                    <div key={header} className="flex">
                      <span className="font-semibold text-blue-600 w-1/3">{header}:</span>
                      <span className="text-gray-700">{value}</span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => downloadFile(
                    Object.entries(securityHeaders)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join('\n'),
                    'security-headers.txt'
                  )}
                  size="sm"
                  className="mt-4 w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Headers Configuration
                </Button>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Production Deployment:</strong> These files and headers need to be implemented at the server level 
              (nginx, Apache, CDN) for full effectiveness. The generated files provide the configuration needed 
              for production deployment.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};