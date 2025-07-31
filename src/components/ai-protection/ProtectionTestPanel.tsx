import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TestTube, Upload, Download, CheckCircle, AlertCircle } from "lucide-react";
import { enhancedRealWorldProtection } from "@/lib/enhancedRealWorldProtection";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const ProtectionTestPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const createTestFile = () => {
    // Create a small test file
    const testContent = "TSMO AI Protection Test File - " + new Date().toISOString();
    const blob = new Blob([testContent], { type: 'text/plain' });
    return new File([blob], 'test-protection.txt', { type: 'text/plain' });
  };

  const runProtectionTest = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to test protection functionality.",
        variant: "destructive"
      });
      return;
    }

    setTesting(true);
    try {
      const testFile = createTestFile();
      
      toast({
        title: "Testing Protection",
        description: "Applying all 6 protection methods to test file...",
      });

      const result = await enhancedRealWorldProtection.protectFileWithDatabase(testFile, {
        enableAdversarialNoise: true,
        enableRightsMetadata: true,
        enableCrawlerBlocking: true,
        enableInvisibleWatermark: true,
        enableBlockchainRegistration: true,
        enableLikenessProtection: true,
        protectionLevel: 'maximum',
        copyrightInfo: {
          owner: 'TSMO Test User',
          year: new Date().getFullYear(),
          rights: 'All Rights Reserved - Test File'
        },
        userId: user.id,
        fileName: testFile.name
      });

      setTestResults(result);

      if (result.success) {
        toast({
          title: "Protection Test Successful!",
          description: `File protected with ${result.protectionMethods.length} methods and saved to storage.`,
        });
      } else {
        toast({
          title: "Protection Test Failed",
          description: result.errors?.join(', ') || "Unknown error occurred",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Protection test failed:', error);
      toast({
        title: "Test Error",
        description: error instanceof Error ? error.message : "Test failed unexpectedly",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  const downloadTestFile = async () => {
    if (!testResults?.storagePath) {
      toast({
        title: "No File to Download",
        description: "Run the protection test first to create a protected file.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from('ai-protected-files')
        .download(testResults.storagePath);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'protected-test-file.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Successful",
        description: "Protected test file downloaded successfully.",
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Download failed unexpectedly",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          AI Protection Test Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Test the complete AI protection pipeline: create file → apply all 6 protection methods → save to storage → download
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={runProtectionTest}
            disabled={testing}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {testing ? 'Testing...' : 'Run Protection Test'}
          </Button>

          {testResults?.success && (
            <Button 
              onClick={downloadTestFile}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Test File
            </Button>
          )}
        </div>

        {testResults && (
          <div className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              {testResults.success ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="font-medium">
                Test {testResults.success ? 'Passed' : 'Failed'}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <strong>Protection ID:</strong> {testResults.protectionId || 'N/A'}
              </div>
              <div>
                <strong>Storage Path:</strong> {testResults.storagePath || 'N/A'}
              </div>
              <div>
                <strong>Protection Level:</strong> {testResults.protectionLevel || 'N/A'}
              </div>
              <div>
                <strong>Record ID:</strong> {testResults.recordId || 'N/A'}
              </div>
              
              {testResults.protectionMethods && testResults.protectionMethods.length > 0 && (
                <div>
                  <strong>Applied Methods ({testResults.protectionMethods.length}/6):</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {testResults.protectionMethods.map((method: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {method}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {testResults.errors && testResults.errors.length > 0 && (
                <div>
                  <strong>Errors:</strong>
                  <ul className="list-disc list-inside text-red-600">
                    {testResults.errors.map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <strong>Expected Methods:</strong> adversarial_noise, rights_metadata, crawler_blocking, 
          invisible_watermark, blockchain_registration, likeness_protection, advanced_fingerprinting, maximum_obfuscation
        </div>
      </CardContent>
    </Card>
  );
};