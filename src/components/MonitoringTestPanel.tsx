import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Info, AlertTriangle, Terminal, Gauge, Server, Activity, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import testCopyrightedImage from '@/assets/test-copyrighted-image.png';
import CopyrightMatches from '@/components/monitoring/CopyrightMatches';

const MonitoringTestPanel = () => {
  const { toast } = useToast();
  const [artworkId, setArtworkId] = useState<string>('');
  const [scanId, setScanId] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [testResults, setTestResults] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [useCopyrightedImage, setUseCopyrightedImage] = useState(false);

  const handleFetchRandomArtwork = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('artwork')
        .select('id, file_paths')
        .limit(1)
        .single();

      if (error) throw error;
      
      if (data) {
        setArtworkId(data.id);
        
        // Generate a signed URL for testing
        if (data.file_paths && data.file_paths.length > 0) {
          const { data: signedData } = await supabase.storage
            .from('artwork')
            .createSignedUrl(data.file_paths[0], 3600);
            
          if (signedData) {
            setImageUrl(signedData.signedUrl);
          }
        }
      }
      
      setTestResults(null);
    } catch (error: any) {
      console.error('Error fetching artwork:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testProcessMonitoringScan = async () => {
    if (!artworkId) {
      toast({
        title: "Missing Artwork ID",
        description: "Please fetch or enter an artwork ID first",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setTestResults(null);
    
    try {
      // Create a new scan record
      const { data: scan, error: scanError } = await supabase
        .from('monitoring_scans')
        .insert({
          artwork_id: artworkId,
          scan_type: 'test',
          status: 'pending',
          total_sources: 1000000
        })
        .select()
        .single();

      if (scanError) throw scanError;
      
      setScanId(scan.id);
      
      // Call the process-monitoring-scan function
      const { data, error } = await supabase.functions
        .invoke('process-monitoring-scan', {
          body: {
            scanId: scan.id,
            artworkId: artworkId,
            testCopyrightedImage: useCopyrightedImage,
            forceMockResults: true
          }
        });

      if (error) throw error;
      
      // Show a specific message if using the test copyrighted image
      let successMessage = data.message || 'Process monitoring scan function completed successfully';
      if (useCopyrightedImage) {
        successMessage = `Test completed with copyrighted image. Found ${data.matchesFound || 0} potential matches!`;
      }
      
      setTestResults({
        success: true,
        message: successMessage,
        details: data
      });
      
      toast({
        title: useCopyrightedImage ? "Copyrighted Image Test Successful" : "Test Successful",
        description: useCopyrightedImage 
          ? `Found ${data.matchesFound || 0} potential copyright matches!` 
          : "The monitoring scan process completed successfully"
      });
    } catch (error: any) {
      console.error('Test error:', error);
      setTestResults({
        success: false,
        message: error.message || 'An error occurred during the test',
        details: error
      });
      
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testRealImageSearch = async () => {
    // If we're using the test copyrighted image, we don't need a real image URL
    if (!useCopyrightedImage && !imageUrl) {
      toast({
        title: "Missing Image URL",
        description: "Please fetch an artwork with an image or use the test copyrighted image",
        variant: "destructive"
      });
      return;
    }

    if (!artworkId) {
      toast({
        title: "Missing Artwork ID",
        description: "Please fetch or enter an artwork ID first",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setTestResults(null);
    
    try {
      // Create a new scan record if we don't have one
      let currentScanId = scanId;
      
      if (!currentScanId) {
        const { data: scan, error: scanError } = await supabase
          .from('monitoring_scans')
          .insert({
            artwork_id: artworkId,
            scan_type: 'test',
            status: 'pending',
            total_sources: 1000
          })
          .select()
          .single();

        if (scanError) throw scanError;
        currentScanId = scan.id;
        setScanId(scan.id);
      }
      
      // Determine which image URL to use
      const testImageUrl = useCopyrightedImage 
        ? window.location.origin + testCopyrightedImage  // Get full URL to the test image
        : imageUrl;

      // Call the real-image-search function
      const { data, error } = await supabase.functions
        .invoke('real-image-search', {
          body: {
            imageUrl: testImageUrl,
            artworkId: artworkId,
            scanId: currentScanId,
            testCopyrightedImage: useCopyrightedImage, // Add flag to indicate we're testing with a copyrighted image
            forceMockResults: true // Force mock results for training purposes
          }
        });

      if (error) throw error;
      
      setTestResults({
        success: true,
        message: `Image search completed successfully with ${data.results || 0} results`,
        details: data
      });
      
      toast({
        title: "Test Successful",
        description: `Found ${data.highConfidenceMatches || 0} high confidence matches`
      });
    } catch (error: any) {
      console.error('Test error:', error);
      setTestResults({
        success: false,
        message: error.message || 'An error occurred during the test',
        details: error
      });
      
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testAPIKeys = async () => {
    setIsLoading(true);
    setTestResults(null);
    
    const apiServices = [
      { name: 'Google Custom Search', envVar: 'GOOGLE_CUSTOM_SEARCH_API_KEY' },
      { name: 'Google Search Engine', envVar: 'GOOGLE_SEARCH_ENGINE_ID' },
      { name: 'Bing Visual Search', envVar: 'BING_VISUAL_SEARCH_API_KEY' },
      { name: 'TinEye', envVar: 'TINEYE_API_KEY' },
      { name: 'TinEye Secret', envVar: 'TINEYE_API_SECRET' },
      { name: 'OpenAI', envVar: 'OPENAI_API_KEY' },
      { name: 'SerpAPI', envVar: 'SERPAPI_KEY' }
    ];
    
    try {
      // Create a simple function to check API keys
      const { data, error } = await supabase.functions
        .invoke('real-image-search', {
          body: {
            testMode: true,
            checkApiKeys: true
          }
        });

      if (error) throw error;
      
      setTestResults({
        success: true,
        message: 'API key check completed',
        details: data
      });
      
      toast({
        title: "API Check Completed",
        description: "API keys availability check completed"
      });
    } catch (error: any) {
      console.error('API test error:', error);
      setTestResults({
        success: false,
        message: error.message || 'An error occurred during API key testing',
        details: error
      });
      
      toast({
        title: "API Test Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-5 w-5" />
          Monitoring System Test Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            This panel helps you test and debug the artwork monitoring system. Start by fetching a random artwork or entering IDs manually.
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="space-y-1 flex-1">
            <Label htmlFor="artworkId">Artwork ID</Label>
            <Input 
              id="artworkId" 
              value={artworkId} 
              onChange={(e) => setArtworkId(e.target.value)}
              placeholder="Enter artwork ID or fetch random"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={handleFetchRandomArtwork}
            disabled={isLoading}
            className="sm:mt-0"
          >
            Fetch Random Artwork
          </Button>
        </div>
        
        <div className="flex flex-col gap-1">
          <Label htmlFor="scanId">Scan ID (auto-generated)</Label>
          <Input 
            id="scanId" 
            value={scanId} 
            onChange={(e) => setScanId(e.target.value)}
            placeholder="Will be auto-generated when testing"
            disabled
          />
        </div>
        
        <div className="flex flex-col gap-1">
          <Label htmlFor="imageUrl">Image URL (from selected artwork)</Label>
          <Input 
            id="imageUrl" 
            value={imageUrl} 
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Will be populated when artwork has images"
            disabled
          />
        </div>
        
<div className="flex flex-col gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="useCopyrightedImage" 
              checked={useCopyrightedImage} 
              onCheckedChange={() => setUseCopyrightedImage(!useCopyrightedImage)} 
            />
            <label
              htmlFor="useCopyrightedImage"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Use test copyrighted image
            </label>
          </div>
          
          {useCopyrightedImage && (
            <div className="border p-4 rounded-md">
              <div className="text-sm font-medium mb-2">Test Image (Known copyrighted)</div>
              <img 
                src={testCopyrightedImage} 
                alt="Test copyrighted image"
                className="w-32 h-32 object-cover rounded-md mb-2" 
              />
              <div className="text-xs text-muted-foreground">
                This image will be used instead of any artwork image in tests
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setIsDebugMode(!isDebugMode)}
            >
              <Terminal className="h-4 w-4 mr-2" />
              {isDebugMode ? 'Hide Debug Info' : 'Show Debug Info'}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={testAPIKeys}
              disabled={isLoading}
            >
              <Server className="h-4 w-4 mr-2" />
              Test API Keys
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="full" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="full">Full Monitoring Test</TabsTrigger>
            <TabsTrigger value="image-search">Image Search Test</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="full" className="space-y-4 mt-4">
            <div className="text-sm text-muted-foreground">
              Tests the entire monitoring scan process including reverse image search and simulated dark web scanning.
            </div>
            
            <Button 
              onClick={testProcessMonitoringScan} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <Activity className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Gauge className="h-4 w-4 mr-2" />
              )}
              Run Full Monitoring Test
            </Button>
          </TabsContent>
          
          <TabsContent value="image-search" className="space-y-4 mt-4">
            <div className="text-sm text-muted-foreground">
              Tests only the reverse image search functionality using real API services (Google, Bing, etc).
            </div>
            
            <Button 
              onClick={testRealImageSearch} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <Activity className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Gauge className="h-4 w-4 mr-2" />
              )}
              Test Reverse Image Search
            </Button>
          </TabsContent>

          <TabsContent value="results" className="space-y-4 mt-4">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Found Copyright Matches</h3>
            </div>
            {!scanId ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Run a monitoring test first to see potential copyright matches here.
                </AlertDescription>
              </Alert>
            ) : (
              <CopyrightMatches />
            )}
          </TabsContent>
        </Tabs>
        
        {testResults && (
          <Alert className={testResults.success ? "bg-green-50" : "bg-red-50"}>
            {testResults.success ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={testResults.success ? "text-green-800" : "text-red-800"}>
              {testResults.message}
            </AlertDescription>
          </Alert>
        )}
        
        {isDebugMode && testResults && (
          <div className="mt-4 p-4 bg-slate-50 rounded-md border overflow-auto">
            <h4 className="font-medium mb-2 text-slate-700">Debug Information</h4>
            <pre className="text-xs text-slate-700 whitespace-pre-wrap">
              {JSON.stringify(testResults.details, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MonitoringTestPanel;