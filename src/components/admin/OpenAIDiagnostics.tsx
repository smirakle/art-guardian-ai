import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  Eye, 
  DollarSign,
  Zap,
  Activity
} from 'lucide-react';

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
  responseTime?: number;
  tokenUsage?: any;
  estimatedCost?: number;
}

export const OpenAIDiagnostics = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [connectionTest, setConnectionTest] = useState<TestResult | null>(null);
  const [visionTest, setVisionTest] = useState<TestResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const testConnection = async () => {
    setLoading(true);
    setConnectionTest(null);
    addLog('Testing OpenAI API connection...');

    try {
      const { data, error } = await supabase.functions.invoke('test-openai-api', {
        body: { testType: 'connection' }
      });

      if (error) throw error;

      setConnectionTest(data);
      addLog(`Connection test ${data.success ? 'PASSED' : 'FAILED'}: ${data.message}`);
      
      if (data.success) {
        toast({
          title: "✅ OpenAI Connected",
          description: `Response time: ${data.responseTime}ms`,
        });
      } else {
        toast({
          title: "❌ Connection Failed",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Unknown error';
      setConnectionTest({
        success: false,
        message: errorMsg
      });
      addLog(`Connection test ERROR: ${errorMsg}`);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testVision = async () => {
    setLoading(true);
    setVisionTest(null);
    addLog('Testing OpenAI Vision API...');

    try {
      const { data, error } = await supabase.functions.invoke('test-openai-api', {
        body: { 
          testType: 'vision',
          imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4'
        }
      });

      if (error) throw error;

      setVisionTest(data);
      addLog(`Vision test ${data.success ? 'PASSED' : 'FAILED'}: ${data.message}`);
      
      if (data.success) {
        toast({
          title: "✅ Vision API Working",
          description: `Analyzed image in ${data.responseTime}ms`,
        });
      } else {
        toast({
          title: "❌ Vision Test Failed",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Unknown error';
      setVisionTest({
        success: false,
        message: errorMsg
      });
      addLog(`Vision test ERROR: ${errorMsg}`);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runFullDiagnostic = async () => {
    setLogs([]);
    addLog('Starting full OpenAI diagnostic suite...');
    await testConnection();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testVision();
    addLog('Diagnostic suite completed.');
  };

  const ResultCard = ({ result, title, icon: Icon }: { 
    result: TestResult | null; 
    title: string;
    icon: any;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!result ? (
          <p className="text-muted-foreground">Not tested yet</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                {result.message}
              </span>
            </div>

            {result.responseTime && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Response Time:</span>
                <Badge variant="outline">{result.responseTime}ms</Badge>
              </div>
            )}

            {result.tokenUsage && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tokens Used:</span>
                <Badge variant="outline">
                  {result.tokenUsage.total_tokens} tokens
                </Badge>
              </div>
            )}

            {result.estimatedCost !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated Cost:</span>
                <Badge variant="outline" className="text-green-600">
                  ${result.estimatedCost.toFixed(4)}
                </Badge>
              </div>
            )}

            {result.details && (
              <div className="mt-3 p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Details:</p>
                <pre className="text-xs mt-2 overflow-auto max-h-40">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-6 w-6" />
            OpenAI API Diagnostics
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Test and monitor OpenAI API integration in real-time
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button 
              onClick={testConnection} 
              disabled={loading}
              variant="outline"
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
              Test Connection
            </Button>
            <Button 
              onClick={testVision} 
              disabled={loading}
              variant="outline"
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
              Test Vision API
            </Button>
            <Button 
              onClick={runFullDiagnostic} 
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Run Full Diagnostic
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResultCard 
          result={connectionTest}
          title="Connection Test"
          icon={Zap}
        />
        <ResultCard 
          result={visionTest}
          title="Vision API Test"
          icon={Eye}
        />
      </div>

      {/* Cost Estimation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cost Estimation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Per Copyright Scan</p>
              <p className="text-2xl font-bold">~$0.02</p>
              <p className="text-xs text-muted-foreground mt-1">GPT-4o Vision analysis</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Per Deepfake Detection</p>
              <p className="text-2xl font-bold">~$0.03</p>
              <p className="text-xs text-muted-foreground mt-1">Multi-modal analysis</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Per Legal Document</p>
              <p className="text-2xl font-bold">~$0.05</p>
              <p className="text-xs text-muted-foreground mt-1">GPT-5 generation</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Real-Time Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs max-h-60 overflow-auto">
              {logs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning Banner */}
      {(connectionTest && !connectionTest.success) || (visionTest && !visionTest.success) && (
        <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-semibold text-orange-800 dark:text-orange-200">
                  OpenAI API Issue Detected
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  Your OpenAI API integration is not working properly. This means:
                </p>
                <ul className="text-sm text-orange-700 dark:text-orange-300 mt-2 space-y-1 list-disc list-inside">
                  <li>Copyright scans may be using fallback logic (less accurate)</li>
                  <li>Deepfake detection may return simulated results</li>
                  <li>Vision analysis features may not be available</li>
                </ul>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-3">
                  <strong>Action Required:</strong> Check your OpenAI API key balance and permissions in Supabase Edge Function secrets.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
