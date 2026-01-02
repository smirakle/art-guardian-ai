import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Shield, 
  CheckCircle, 
  FileImage, 
  Layers, 
  Plus, 
  Trash2, 
  Play, 
  Copy, 
  Download,
  RefreshCw,
  AlertCircle,
  Clock,
  Zap,
  Terminal,
  FileCheck,
  List,
  Activity
} from "lucide-react";

const API_URL = "https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/adobe-plugin-api";

interface MockLayer {
  id: string;
  name: string;
  type: "image" | "text" | "shape" | "adjustment";
}

interface MockDocument {
  name: string;
  format: "psd" | "ai" | "png" | "jpg";
  width: number;
  height: number;
  layers: MockLayer[];
}

interface ApiCall {
  id: string;
  timestamp: Date;
  action: string;
  request: any;
  response: any;
  status: number;
  duration: number;
}

interface HealthStatus {
  healthy: boolean;
  version: string;
  c2paMode: string;
  timestamp: string;
}

const AdobePluginSimulator = () => {
  const { toast } = useToast();
  
  // Mock document state
  const [mockDocument, setMockDocument] = useState<MockDocument>({
    name: "Artwork.psd",
    format: "psd",
    width: 1920,
    height: 1080,
    layers: [
      { id: "1", name: "Background", type: "image" },
      { id: "2", name: "Main Subject", type: "image" },
      { id: "3", name: "Title Text", type: "text" },
    ]
  });
  
  // Plugin settings state
  const [protectionLevel, setProtectionLevel] = useState<"basic" | "professional" | "enterprise">("professional");
  const [copyrightOwner, setCopyrightOwner] = useState("John Doe");
  const [copyrightYear, setCopyrightYear] = useState(new Date().getFullYear().toString());
  const [autoProtect, setAutoProtect] = useState(true);
  const [showNotifications, setShowNotifications] = useState(true);
  
  // API state
  const [isLoading, setIsLoading] = useState(false);
  const [apiCalls, setApiCalls] = useState<ApiCall[]>([]);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [selectedCall, setSelectedCall] = useState<ApiCall | null>(null);
  
  // Generate mock document hash
  const generateDocumentHash = useCallback(() => {
    const data = `${mockDocument.name}-${mockDocument.width}x${mockDocument.height}-${Date.now()}`;
    return btoa(data).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  }, [mockDocument]);
  
  // Add layer
  const addLayer = () => {
    const newLayer: MockLayer = {
      id: Date.now().toString(),
      name: `Layer ${mockDocument.layers.length + 1}`,
      type: "image"
    };
    setMockDocument(prev => ({
      ...prev,
      layers: [...prev.layers, newLayer]
    }));
  };
  
  // Remove layer
  const removeLayer = (id: string) => {
    setMockDocument(prev => ({
      ...prev,
      layers: prev.layers.filter(l => l.id !== id)
    }));
  };
  
  // Log API call
  const logApiCall = (action: string, request: any, response: any, status: number, duration: number) => {
    const call: ApiCall = {
      id: Date.now().toString(),
      timestamp: new Date(),
      action,
      request,
      response,
      status,
      duration
    };
    setApiCalls(prev => [call, ...prev].slice(0, 50));
    setSelectedCall(call);
    return call;
  };
  
  // Health check
  const checkHealth = async () => {
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${API_URL}?action=health`);
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      setHealthStatus({
        healthy: data.status === "healthy",
        version: data.version || "1.0.0",
        c2paMode: data.c2pa_signing || "placeholder",
        timestamp: new Date().toISOString()
      });
      
      logApiCall("health", { action: "health" }, data, response.status, duration);
      
      toast({
        title: "Health Check Complete",
        description: `API is ${data.status}. Response time: ${duration}ms`,
      });
    } catch (error: any) {
      logApiCall("health", { action: "health" }, { error: error.message }, 500, Date.now() - startTime);
      toast({
        title: "Health Check Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Protect document
  const protectDocument = async () => {
    setIsLoading(true);
    const startTime = Date.now();
    
    const requestBody = {
      action: "protect",
      documentName: mockDocument.name,
      documentHash: generateDocumentHash(),
      protectionLevel,
      copyrightOwner,
      copyrightYear: parseInt(copyrightYear),
      metadata: {
        width: mockDocument.width,
        height: mockDocument.height,
        format: mockDocument.format,
        layers: mockDocument.layers.length,
        source: "adobe_plugin_simulator"
      }
    };
    
    try {
      const { data, error } = await supabase.functions.invoke("adobe-plugin-api", {
        body: requestBody
      });
      
      const duration = Date.now() - startTime;
      
      if (error) throw error;
      
      logApiCall("protect", requestBody, data, 200, duration);
      
      toast({
        title: "Document Protected",
        description: `Protection ID: ${data.protectionId}`,
      });
    } catch (error: any) {
      logApiCall("protect", requestBody, { error: error.message }, 500, Date.now() - startTime);
      toast({
        title: "Protection Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Verify document
  const verifyDocument = async () => {
    setIsLoading(true);
    const startTime = Date.now();
    
    const requestBody = {
      action: "verify",
      documentHash: generateDocumentHash()
    };
    
    try {
      const { data, error } = await supabase.functions.invoke("adobe-plugin-api", {
        body: requestBody
      });
      
      const duration = Date.now() - startTime;
      
      if (error) throw error;
      
      logApiCall("verify", requestBody, data, 200, duration);
      
      toast({
        title: "Verification Complete",
        description: data.verified ? "Document is verified" : "Document not found in registry",
      });
    } catch (error: any) {
      logApiCall("verify", requestBody, { error: error.message }, 500, Date.now() - startTime);
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Batch protect
  const batchProtect = async () => {
    setIsLoading(true);
    const startTime = Date.now();
    
    const documents = mockDocument.layers.map((layer, idx) => ({
      documentName: `${mockDocument.name.replace(/\.[^/.]+$/, "")}_${layer.name}.${mockDocument.format}`,
      documentHash: generateDocumentHash() + idx,
      metadata: { layer: layer.name, type: layer.type }
    }));
    
    const requestBody = {
      action: "batch_protect",
      documents,
      protectionLevel,
      copyrightOwner,
      copyrightYear: parseInt(copyrightYear)
    };
    
    try {
      const { data, error } = await supabase.functions.invoke("adobe-plugin-api", {
        body: requestBody
      });
      
      const duration = Date.now() - startTime;
      
      if (error) throw error;
      
      logApiCall("batch_protect", requestBody, data, 200, duration);
      
      toast({
        title: "Batch Protection Complete",
        description: `Protected ${data.results?.length || 0} documents`,
      });
    } catch (error: any) {
      logApiCall("batch_protect", requestBody, { error: error.message }, 500, Date.now() - startTime);
      toast({
        title: "Batch Protection Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // List protections
  const listProtections = async () => {
    setIsLoading(true);
    const startTime = Date.now();
    
    const requestBody = {
      action: "list_protections",
      limit: 10
    };
    
    try {
      const { data, error } = await supabase.functions.invoke("adobe-plugin-api", {
        body: requestBody
      });
      
      const duration = Date.now() - startTime;
      
      if (error) throw error;
      
      logApiCall("list_protections", requestBody, data, 200, duration);
      
      toast({
        title: "Protections Listed",
        description: `Found ${data.protections?.length || 0} protection records`,
      });
    } catch (error: any) {
      logApiCall("list_protections", requestBody, { error: error.message }, 500, Date.now() - startTime);
      toast({
        title: "List Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get status
  const getStatus = async () => {
    setIsLoading(true);
    const startTime = Date.now();
    
    const requestBody = {
      action: "get_status"
    };
    
    try {
      const { data, error } = await supabase.functions.invoke("adobe-plugin-api", {
        body: requestBody
      });
      
      const duration = Date.now() - startTime;
      
      if (error) throw error;
      
      logApiCall("get_status", requestBody, data, 200, duration);
      
      toast({
        title: "Status Retrieved",
        description: `API version: ${data.version || "1.0.0"}`,
      });
    } catch (error: any) {
      logApiCall("get_status", requestBody, { error: error.message }, 500, Date.now() - startTime);
      toast({
        title: "Status Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Copy as cURL
  const copyAsCurl = (call: ApiCall) => {
    const isGetRequest = call.action === "health";
    let curlCommand: string;
    
    if (isGetRequest) {
      curlCommand = `curl -X GET "${API_URL}?action=${call.action}"`;
    } else {
      curlCommand = `curl -X POST "${API_URL}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '${JSON.stringify(call.request, null, 2)}'`;
    }
    
    navigator.clipboard.writeText(curlCommand);
    toast({
      title: "Copied to Clipboard",
      description: "cURL command copied",
    });
  };
  
  // Export session
  const exportSession = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      mockDocument,
      settings: {
        protectionLevel,
        copyrightOwner,
        copyrightYear,
        autoProtect,
        showNotifications
      },
      apiCalls,
      healthStatus
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `adobe-plugin-test-session-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileImage className="h-6 w-6 text-primary" />
            Adobe Plugin Simulator
          </h2>
          <p className="text-muted-foreground">
            Test the Adobe plugin API without Photoshop
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={checkHealth}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Health Check
          </Button>
          
          {healthStatus && (
            <Badge variant={healthStatus.healthy ? "default" : "destructive"}>
              {healthStatus.healthy ? (
                <><CheckCircle className="h-3 w-3 mr-1" /> Healthy</>
              ) : (
                <><AlertCircle className="h-3 w-3 mr-1" /> Unhealthy</>
              )}
            </Badge>
          )}
        </div>
      </div>
      
      {/* Health Status Bar */}
      {healthStatus && (
        <Card className="bg-muted/30">
          <CardContent className="py-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-6">
                <span><strong>Version:</strong> {healthStatus.version}</span>
                <span><strong>C2PA Mode:</strong> {healthStatus.c2paMode}</span>
                <span><strong>Last Check:</strong> {new Date(healthStatus.timestamp).toLocaleTimeString()}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {healthStatus.c2paMode === "real" ? "🔐 Real C2PA Signing" : "📝 Placeholder Mode"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Mock Document & Plugin UI */}
        <div className="space-y-6">
          {/* Mock Document Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileImage className="h-5 w-5" />
                Mock Document
              </CardTitle>
              <CardDescription>
                Configure the simulated Photoshop document
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Document Name</Label>
                  <Input
                    value={mockDocument.name}
                    onChange={(e) => setMockDocument(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Format</Label>
                  <select
                    className="w-full px-3 py-2 rounded-md border bg-background"
                    value={mockDocument.format}
                    onChange={(e) => setMockDocument(prev => ({ ...prev, format: e.target.value as any }))}
                  >
                    <option value="psd">Photoshop (.psd)</option>
                    <option value="ai">Illustrator (.ai)</option>
                    <option value="png">PNG</option>
                    <option value="jpg">JPEG</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Width (px)</Label>
                  <Input
                    type="number"
                    value={mockDocument.width}
                    onChange={(e) => setMockDocument(prev => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Height (px)</Label>
                  <Input
                    type="number"
                    value={mockDocument.height}
                    onChange={(e) => setMockDocument(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Layers ({mockDocument.layers.length})
                  </Label>
                  <Button size="sm" variant="outline" onClick={addLayer}>
                    <Plus className="h-4 w-4 mr-1" /> Add Layer
                  </Button>
                </div>
                
                <ScrollArea className="h-32 rounded-md border p-2">
                  {mockDocument.layers.map((layer) => (
                    <div key={layer.id} className="flex items-center justify-between py-1 px-2 hover:bg-muted/50 rounded">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {layer.type}
                        </Badge>
                        <span className="text-sm">{layer.name}</span>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => removeLayer(layer.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
          
          {/* Plugin Interface */}
          <Card className="border-primary/50">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                TSMO Protection Panel
              </CardTitle>
              <CardDescription>
                Simulated Adobe plugin interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {/* Protection Level */}
              <div className="space-y-2">
                <Label>Protection Level</Label>
                <RadioGroup
                  value={protectionLevel}
                  onValueChange={(v) => setProtectionLevel(v as any)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="basic" id="basic" />
                    <Label htmlFor="basic" className="font-normal">Basic</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="professional" id="professional" />
                    <Label htmlFor="professional" className="font-normal">Professional</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="enterprise" id="enterprise" />
                    <Label htmlFor="enterprise" className="font-normal">Enterprise</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Copyright Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Copyright Owner</Label>
                  <Input
                    value={copyrightOwner}
                    onChange={(e) => setCopyrightOwner(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input
                    value={copyrightYear}
                    onChange={(e) => setCopyrightYear(e.target.value)}
                    placeholder="2026"
                  />
                </div>
              </div>
              
              {/* Toggles */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={autoProtect}
                    onCheckedChange={setAutoProtect}
                  />
                  <Label className="font-normal">Auto-protect on export</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={showNotifications}
                    onCheckedChange={setShowNotifications}
                  />
                  <Label className="font-normal">Notifications</Label>
                </div>
              </div>
              
              <Separator />
              
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={protectDocument} disabled={isLoading} className="gap-2">
                  <Shield className="h-4 w-4" />
                  Protect
                </Button>
                <Button onClick={verifyDocument} disabled={isLoading} variant="secondary" className="gap-2">
                  <FileCheck className="h-4 w-4" />
                  Verify
                </Button>
                <Button onClick={batchProtect} disabled={isLoading} variant="outline" className="gap-2">
                  <Layers className="h-4 w-4" />
                  Batch Protect
                </Button>
                <Button onClick={listProtections} disabled={isLoading} variant="outline" className="gap-2">
                  <List className="h-4 w-4" />
                  List
                </Button>
              </div>
              
              <Button onClick={getStatus} disabled={isLoading} variant="ghost" className="w-full gap-2">
                <Activity className="h-4 w-4" />
                Get API Status
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column: API Monitor */}
        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    API Call Monitor
                  </CardTitle>
                  <CardDescription>
                    {apiCalls.length} calls in session
                  </CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={exportSession}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="current">
                <TabsList className="w-full">
                  <TabsTrigger value="current" className="flex-1">Current</TabsTrigger>
                  <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="current" className="space-y-4 mt-4">
                  {selectedCall ? (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge>{selectedCall.action}</Badge>
                          <Badge variant={selectedCall.status === 200 ? "default" : "destructive"}>
                            {selectedCall.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {selectedCall.duration}ms
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyAsCurl(selectedCall)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy cURL
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">REQUEST</Label>
                        <ScrollArea className="h-32 rounded-md border bg-muted/30 p-3">
                          <pre className="text-xs font-mono">
                            {JSON.stringify(selectedCall.request, null, 2)}
                          </pre>
                        </ScrollArea>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">RESPONSE</Label>
                        <ScrollArea className="h-48 rounded-md border bg-muted/30 p-3">
                          <pre className="text-xs font-mono">
                            {JSON.stringify(selectedCall.response, null, 2)}
                          </pre>
                        </ScrollArea>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Make an API call to see the request/response</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="history" className="mt-4">
                  <ScrollArea className="h-[400px]">
                    {apiCalls.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        No API calls yet
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {apiCalls.map((call) => (
                          <div
                            key={call.id}
                            className={`p-3 rounded-md border cursor-pointer transition-colors ${
                              selectedCall?.id === call.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                            }`}
                            onClick={() => setSelectedCall(call)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{call.action}</Badge>
                                <Badge variant={call.status === 200 ? "default" : "destructive"} className="text-xs">
                                  {call.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Zap className="h-3 w-3" />
                                {call.duration}ms
                                <span>•</span>
                                {call.timestamp.toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdobePluginSimulator;
