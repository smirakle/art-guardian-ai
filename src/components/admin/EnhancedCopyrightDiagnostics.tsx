import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';

interface ApiStatus {
  name: string;
  working: boolean;
  error?: string;
  response_time?: number;
  status: string;
}

interface DiagnosticResult {
  phase: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
  duration?: number;
}

export function EnhancedCopyrightDiagnostics() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [apiStatus, setApiStatus] = useState<Record<string, ApiStatus>>({});
  const [currentPhase, setCurrentPhase] = useState('');

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [...prev, result]);
  };

  const runComprehensiveDiagnostics = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults([]);
    setApiStatus({});
    
    try {
      // Phase 1: Test API Keys
      setCurrentPhase('Testing API Connectivity');
      setProgress(10);
      
      const startTime = Date.now();
      
      addResult({
        phase: 'API Key Testing',
        status: 'success',
        message: 'Starting API connectivity tests...'
      });

      const { data: apiTestResult, error: apiError } = await supabase.functions.invoke('real-image-search', {
        body: { checkApiKeys: true }
      });

      if (apiError) {
        addResult({
          phase: 'API Key Testing',
          status: 'error',
          message: 'Failed to test API keys',
          details: apiError.message
        });
      } else {
        setApiStatus(apiTestResult.apiStatus || {});
        const workingApis = apiTestResult.totalWorking || 0;
        
        addResult({
          phase: 'API Key Testing',
          status: workingApis > 2 ? 'success' : workingApis > 0 ? 'warning' : 'error',
          message: `API Status: ${workingApis}/5 APIs working`,
          details: `Google: ${apiTestResult.apiStatus?.google?.working ? '✅' : '❌'}, Bing: ${apiTestResult.apiStatus?.bing?.working ? '✅' : '❌'}, TinEye: ${apiTestResult.apiStatus?.tineye?.working ? '✅' : '❌'}, SerpAPI: ${apiTestResult.apiStatus?.serpapi?.working ? '✅' : '❌'}, OpenAI: ${apiTestResult.apiStatus?.openai?.working ? '✅' : '❌'}`
        });
      }

      setProgress(30);

      // Phase 2: Test with Real Image
      setCurrentPhase('Testing Image Search Functionality');
      
      // Create a test artwork entry
      const testImageUrl = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4';
      
      addResult({
        phase: 'Image Search Test',
        status: 'success',
        message: 'Creating test artwork record...'
      });

      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        addResult({
          phase: 'Image Search Test',
          status: 'error',
          message: 'User not authenticated for test'
        });
        return;
      }

      const { data: artwork, error: artworkError } = await supabase
        .from('artwork')
        .insert({
          user_id: user.id,
          title: 'Diagnostic Test Image',
          description: 'Test image for copyright detection diagnostics',
          category: 'test',
          file_paths: [testImageUrl],
          status: 'active'
        })
        .select()
        .single();

      if (artworkError) {
        addResult({
          phase: 'Image Search Test',
          status: 'error',
          message: 'Failed to create test artwork',
          details: artworkError.message
        });
      } else {
        setProgress(50);
        
        addResult({
          phase: 'Image Search Test',
          status: 'success',
          message: 'Test artwork created successfully',
          details: `Artwork ID: ${artwork.id}`
        });

        // Phase 3: Test Image Search
        setCurrentPhase('Running Image Search');
        
        const { data: searchResult, error: searchError } = await supabase.functions.invoke('real-image-search', {
          body: {
            imageUrl: testImageUrl,
            artworkId: artwork.id,
            scanId: 'diagnostic-test'
          }
        });

        if (searchError) {
          addResult({
            phase: 'Image Search Test',
            status: 'error',
            message: 'Image search failed',
            details: searchError.message
          });
        } else {
          addResult({
            phase: 'Image Search Test',
            status: 'success',
            message: `Image search completed successfully`,
            details: `Found ${searchResult.results || 0} total results, ${searchResult.highConfidenceMatches || 0} high-confidence matches`
          });
        }

        setProgress(70);

        // Phase 4: Test Copyright Monitor
        setCurrentPhase('Testing Copyright Monitor');
        
        const { data: monitorResult, error: monitorError } = await supabase.functions.invoke('real-copyright-monitor', {
          body: {
            artworkId: artwork.id,
            imageUrl: testImageUrl
          }
        });

        if (monitorError) {
          addResult({
            phase: 'Copyright Monitor Test',
            status: 'error',
            message: 'Copyright monitor failed',
            details: monitorError.message
          });
        } else {
          addResult({
            phase: 'Copyright Monitor Test',
            status: 'success',
            message: `Copyright monitoring completed`,
            details: `Scan ID: ${monitorResult.scanId}, Matches: ${monitorResult.matchesFound || 0}`
          });
        }

        setProgress(90);

        // Phase 5: Verify Database Records
        setCurrentPhase('Verifying Database Records');
        
        const { data: scans, error: scansError } = await supabase
          .from('monitoring_scans')
          .select('*')
          .eq('artwork_id', artwork.id);

        if (scansError) {
          addResult({
            phase: 'Database Verification',
            status: 'error',
            message: 'Failed to verify scan records',
            details: scansError.message
          });
        } else {
          addResult({
            phase: 'Database Verification',
            status: 'success',
            message: `Found ${scans.length} scan record(s)`,
            details: `Latest scan status: ${scans[0]?.status || 'unknown'}`
          });
        }

        const { data: matches, error: matchesError } = await supabase
          .from('copyright_matches')
          .select('*')
          .eq('artwork_id', artwork.id);

        if (matchesError) {
          addResult({
            phase: 'Database Verification',
            status: 'warning',
            message: 'Could not verify match records',
            details: matchesError.message
          });
        } else {
          addResult({
            phase: 'Database Verification',
            status: 'success',
            message: `Found ${matches.length} copyright match record(s)`,
            details: matches.length > 0 ? `Threat levels: ${[...new Set(matches.map(m => m.threat_level))].join(', ')}` : 'No matches found'
          });
        }

        // Cleanup test artwork
        await supabase
          .from('artwork')
          .delete()
          .eq('id', artwork.id);

        addResult({
          phase: 'Cleanup',
          status: 'success',
          message: 'Test data cleaned up successfully'
        });
      }

      setProgress(100);
      setCurrentPhase('Diagnostics Complete');
      
      const totalDuration = Date.now() - startTime;
      addResult({
        phase: 'Summary',
        status: 'success',
        message: `Comprehensive diagnostics completed in ${(totalDuration / 1000).toFixed(2)}s`,
        duration: totalDuration
      });

    } catch (error) {
      console.error('Diagnostic error:', error);
      addResult({
        phase: 'Error',
        status: 'error',
        message: 'Diagnostic test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsRunning(false);
      setCurrentPhase('');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Loader2 className="w-4 h-4 animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      warning: 'secondary'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Enhanced Copyright Detection Diagnostics
            {isRunning && <Loader2 className="w-5 h-5 animate-spin" />}
          </CardTitle>
          <CardDescription>
            Comprehensive testing of copyright detection APIs, database integration, and end-to-end functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runComprehensiveDiagnostics} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Diagnostics...
              </>
            ) : (
              'Run Enhanced Diagnostics'
            )}
          </Button>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{currentPhase}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {Object.keys(apiStatus).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">API Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(apiStatus).map(([key, api]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium capitalize">{api.name}</div>
                        {api.response_time && (
                          <div className="text-sm text-muted-foreground">
                            {api.response_time}ms
                          </div>
                        )}
                        {api.error && (
                          <div className="text-sm text-red-500 truncate max-w-[200px]">
                            {api.error}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(api.working ? 'success' : 'error')}
                        <Badge variant={api.working ? 'default' : 'destructive'}>
                          {api.working ? 'Working' : 'Error'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Diagnostic Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.status)}
                          <span className="font-medium">{result.phase}</span>
                        </div>
                        {getStatusBadge(result.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {result.message}
                      </p>
                      {result.details && (
                        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                          {result.details}
                        </div>
                      )}
                      {result.duration && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Duration: {(result.duration / 1000).toFixed(2)}s
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>Troubleshooting Guide:</strong></p>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Google API errors:</strong> Verify API key and Custom Search Engine ID in Supabase secrets</li>
                  <li>• <strong>Bing API errors:</strong> Check Visual Search subscription key in Azure</li>
                  <li>• <strong>SerpAPI errors:</strong> Verify API key has sufficient credits</li>
                  <li>• <strong>TinEye errors:</strong> Ensure both API key and secret are configured</li>
                  <li>• <strong>Database errors:</strong> Check artwork table foreign key constraints</li>
                </ul>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://supabase.com/dashboard/project/utneaqmbyjwxaqrrarpc/settings/functions" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Supabase Secrets
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://supabase.com/dashboard/project/utneaqmbyjwxaqrrarpc/functions/real-image-search/logs" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Function Logs
                    </a>
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}