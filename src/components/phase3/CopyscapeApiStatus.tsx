import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";

export const CopyscapeApiStatus = () => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);
  const { toast } = useToast();

  const testCopyscapeApi = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      // Test with a short sample text
      const testText = "This is a sample text to test the Copyscape API integration. It contains unique identifiable content for plagiarism detection testing.";
      
      const sessionId = crypto.randomUUID();
      
      const { data, error } = await supabase.functions.invoke(
        'scan-plagiarism-copyscape',
        {
          body: {
            sessionId: sessionId,
            documentContent: testText
          }
        }
      );

      if (error) {
        setTestResult({
          success: false,
          message: `API Error: ${error.message}`,
          details: error
        });
        toast({
          title: "Copyscape API Test Failed",
          description: error.message,
          variant: "destructive"
        });
      } else if (data?.success) {
        setTestResult({
          success: true,
          message: `API Working! Found ${data.matchesFound || 0} matches.`,
          details: data
        });
        toast({
          title: "Copyscape API Connected",
          description: `Successfully scanned text. ${data.matchesFound || 0} plagiarism matches found.`
        });
      } else {
        setTestResult({
          success: false,
          message: data?.error || "Unknown error occurred",
          details: data
        });
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: `Test failed: ${error.message}`,
        details: error
      });
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Copyscape API Status
          {testResult && (
            testResult.success ? (
              <Badge variant="default" className="ml-auto">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="destructive" className="ml-auto">
                <XCircle className="w-3 h-3 mr-1" />
                Error
              </Badge>
            )
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Test the Copyscape API integration to ensure plagiarism detection is working correctly.
          </p>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={testCopyscapeApi}
              disabled={testing}
              size="sm"
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing API...
                </>
              ) : (
                "Test API Connection"
              )}
            </Button>
          </div>
        </div>

        {testResult && (
          <div className={`p-4 rounded-lg border ${
            testResult.success 
              ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
              : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
          }`}>
            <div className="flex items-start gap-2">
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              )}
              <div className="flex-1 space-y-2">
                <p className={`font-medium ${
                  testResult.success 
                    ? 'text-green-900 dark:text-green-100' 
                    : 'text-red-900 dark:text-red-100'
                }`}>
                  {testResult.message}
                </p>
                
                {testResult.details && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      View Details
                    </summary>
                    <pre className="mt-2 p-2 bg-background/50 rounded overflow-auto max-h-40">
                      {JSON.stringify(testResult.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t space-y-2">
          <h4 className="text-sm font-medium">API Configuration</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Endpoint:</span>
              <p className="font-mono">copyscape.com/api/</p>
            </div>
            <div>
              <span className="text-muted-foreground">Cost per scan:</span>
              <p>$0.05</p>
            </div>
            <div>
              <span className="text-muted-foreground">Results per scan:</span>
              <p>Up to 10 matches</p>
            </div>
            <div>
              <span className="text-muted-foreground">Text limit:</span>
              <p>10,000 characters</p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> Each plagiarism scan costs $0.05. The API will search the web for content matching your documents and return up to 10 results with similarity percentages.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
