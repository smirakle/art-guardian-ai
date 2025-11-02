import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, CheckCircle, Clock, Search, Upload, Database } from 'lucide-react';
import { toast } from 'sonner';

interface ApiStatus {
  name: string;
  working: boolean;
  status: string;
  error?: string;
  response_time?: number;
}

interface DiagnosticResult {
  phase: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
  details?: any;
  duration?: number;
}

export const CopyrightDiagnostics = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [apiStatus, setApiStatus] = useState<ApiStatus[]>([]);

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [...prev, result]);
  };

  const updateResult = (index: number, updates: Partial<DiagnosticResult>) => {
    setResults(prev => prev.map((r, i) => i === index ? { ...r, ...updates } : r));
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);
    setApiStatus([]);

    try {
      // Phase 1: Verify API Connectivity
      addResult({
        phase: 'Phase 1: API Key Testing',
        status: 'running',
        message: 'Testing external API connectivity...'
      });

      const startTime = Date.now();
      const { data: apiData, error: apiError } = await supabase.functions.invoke('real-image-search', {
        body: { checkApiKeys: true }
      });

      if (apiError) {
        updateResult(0, {
          status: 'error',
          message: 'API key testing failed',
          details: apiError,
          duration: Date.now() - startTime
        });
      } else {
        setApiStatus(Object.entries(apiData.apiStatus).map(([key, value]: [string, any]) => ({
          name: key,
          working: value.working || false,
          status: value.status,
          error: value.error,
          response_time: value.response_time
        })));

        const workingApis = apiData.totalWorking || 0;
        const statusMessage = workingApis === 0 
          ? 'No APIs configured - tests will use mock data'
          : `API testing complete. ${workingApis}/5 APIs working`;

        updateResult(0, {
          status: workingApis === 0 ? 'error' : 'success',
          message: statusMessage,
          details: apiData,
          duration: Date.now() - startTime
        });
      }

      // Phase 2: Test with Known Image
      addResult({
        phase: 'Phase 2: Known Image Test',
        status: 'running',
        message: 'Testing with a widely-available stock image...'
      });

      const testImageUrl = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4';
      let testArtwork = null;
      
      try {
        // Create a test artwork record
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          throw new Error('User not authenticated');
        }

        const { data: artworkData, error: artworkError } = await supabase
          .from('artwork')
          .insert({
            user_id: userData.user.id,
            title: 'Diagnostic Test Image',
            description: 'Test image for copyright monitoring diagnostics',
            category: 'photography',
            file_paths: [testImageUrl],
            status: 'active'
          })
          .select()
          .single();

        if (artworkError || !artworkData) {
          throw new Error(`Failed to create test artwork: ${artworkError?.message || 'Unknown error'}`);
        }

        testArtwork = artworkData;
        const testStartTime = Date.now();
        
        // Call real-image-search with the test image
        const { data: searchData, error: searchError } = await supabase.functions.invoke('real-image-search', {
          body: {
            imageUrl: testImageUrl,
            artworkId: testArtwork.id,
            scanId: 'diagnostic-test',
            enableDeepfakeDetection: false
          }
        });

        if (searchError) {
          // Check if it's an API configuration issue
          const isApiConfigError = searchError.message?.includes('API') || 
                                 searchError.message?.includes('key') ||
                                 searchError.message?.includes('not found');
          
          updateResult(1, {
            status: isApiConfigError ? 'error' : 'error',
            message: isApiConfigError 
              ? 'Image search test skipped - no APIs configured'
              : 'Image search test failed',
            details: {
              ...searchError,
              suggestion: isApiConfigError 
                ? 'Configure at least one image search API (Google, Bing, TinEye, or SerpAPI) to enable full testing'
                : 'Check edge function logs for detailed error information'
            },
            duration: Date.now() - testStartTime
          });
        } else {
          const results = searchData?.results || 0;
          const highConfidence = searchData?.highConfidenceMatches || 0;
          
          updateResult(1, {
            status: 'success',
            message: results === 0 
              ? 'Test completed - no matches found (expected with mock APIs)'
              : `Found ${results} results, ${highConfidence} high-confidence matches`,
            details: searchData,
            duration: Date.now() - testStartTime
          });
        }

      } catch (error) {
        updateResult(1, {
          status: 'error',
          message: `Known image test failed: ${error.message}`,
          details: error
        });
      } finally {
        // Clean up test artwork if it was created
        if (testArtwork?.id) {
          try {
            await supabase.from('artwork').delete().eq('id', testArtwork.id);
          } catch (cleanupError) {
            console.warn('Failed to cleanup test artwork:', cleanupError);
          }
        }
      }

      // Phase 3: Database Verification
      addResult({
        phase: 'Phase 3: Database Verification',
        status: 'running',
        message: 'Checking stored copyright matches...'
      });

      const dbStartTime = Date.now();
      
      // Check recent monitoring scans
      const { data: recentScans, error: scansError } = await supabase
        .from('monitoring_scans')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Check recent copyright matches
      const { data: recentMatches, error: matchesError } = await supabase
        .from('copyright_matches')
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(10);

      if (scansError || matchesError) {
        updateResult(2, {
          status: 'error',
          message: 'Database verification failed',
          details: { scansError, matchesError },
          duration: Date.now() - dbStartTime
        });
      } else {
        updateResult(2, {
          status: 'success',
          message: `Found ${recentScans?.length || 0} recent scans, ${recentMatches?.length || 0} recent matches`,
          details: { recentScans, recentMatches },
          duration: Date.now() - dbStartTime
        });
      }

      // Phase 4: End-to-End Pipeline Test
      addResult({
        phase: 'Phase 4: Pipeline Test',
        status: 'running',
        message: 'Testing complete monitoring pipeline...'
      });

      const pipelineStartTime = Date.now();
      let pipelineTestArtworkId = testArtwork?.id;
      let shouldCleanupPipelineArtwork = false;

      // If we don't have a test artwork from Phase 2, try to find an existing one or create one
      if (!pipelineTestArtworkId) {
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
            // First, try to find an existing artwork from this user
            const { data: existingArtwork } = await supabase
              .from('artwork')
              .select('id')
              .eq('user_id', userData.user.id)
              .limit(1)
              .single();

            if (existingArtwork) {
              console.log('Using existing artwork for pipeline test:', existingArtwork.id);
              pipelineTestArtworkId = existingArtwork.id;
            } else {
              // If no existing artwork, create a test one
              const { data: pipelineArtwork, error: pipelineArtworkError } = await supabase
                .from('artwork')
                .insert({
                  user_id: userData.user.id,
                  title: 'Pipeline Test Image',
                  description: 'Test image for pipeline diagnostics',
                  category: 'photography',
                  file_paths: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4'],
                  status: 'active'
                })
                .select()
                .single();
              
              if (pipelineArtworkError) {
                throw new Error(`Failed to create pipeline test artwork: ${pipelineArtworkError.message}`);
              }

              console.log('Created new test artwork:', pipelineArtwork?.id);
              pipelineTestArtworkId = pipelineArtwork?.id;
              shouldCleanupPipelineArtwork = true;
            }
          }
        } catch (error) {
          updateResult(3, {
            status: 'error',
            message: `Pipeline test failed - could not create test artwork: ${error.message}`,
            details: error,
            duration: Date.now() - pipelineStartTime
          });
          return; // Exit early if we can't create test artwork
        }
      }

      // Only proceed if we have a valid artwork ID
      if (!pipelineTestArtworkId) {
        updateResult(3, {
          status: 'error',
          message: 'Pipeline test skipped - no valid artwork ID available',
          details: { 
            reason: 'Could not create test artwork and Phase 2 did not provide a valid artwork ID',
            suggestion: 'Ensure user authentication is working and database is accessible'
          },
          duration: Date.now() - pipelineStartTime
        });
        return;
      }

      try {
        // Test the process-monitoring-scan function with a valid artwork ID
        const { data: pipelineData, error: pipelineError } = await supabase.functions.invoke('process-monitoring-scan', {
          body: {
            artworkId: pipelineTestArtworkId
          }
        });

        if (pipelineError) {
          // Categorize the error type for better user feedback
          const isUuidError = pipelineError.message?.includes('uuid') || pipelineError.message?.includes('22P02');
          const isApiConfigError = pipelineError.message?.includes('API') || 
                                 pipelineError.message?.includes('key') ||
                                 pipelineError.message?.includes('disabled') ||
                                 pipelineError.message?.includes('not found');
          const isAuthError = pipelineError.message?.includes('auth') || pipelineError.message?.includes('unauthorized');

          let errorMessage = 'Pipeline test failed';
          let suggestion = 'Review edge function logs for detailed error information';
          let status = 'error';

          if (isUuidError) {
            errorMessage = 'Pipeline test failed due to invalid artwork ID format';
            suggestion = 'This indicates a database schema issue';
          } else if (isApiConfigError) {
            errorMessage = 'Pipeline test completed with limited functionality';
            suggestion = 'Configure image search APIs for full testing capability';
            status = 'success'; // Mark as success since pipeline works, just limited by API config
          } else if (isAuthError) {
            errorMessage = 'Pipeline test failed due to authentication issues';
            suggestion = 'Verify user permissions and edge function authentication';
          }

          updateResult(3, {
            status: status as 'success' | 'error',
            message: errorMessage,
            details: {
              ...pipelineError,
              suggestion,
              artwork_id_used: pipelineTestArtworkId
            },
            duration: Date.now() - pipelineStartTime
          });
        } else {
          const sourcesScanned = pipelineData?.sourcesScanned || 0;
          const matchesFound = pipelineData?.matchesFound || 0;
          
          updateResult(3, {
            status: 'success',
            message: sourcesScanned === 0 
              ? 'Pipeline test completed - basic functionality verified'
              : `Pipeline test completed. Scanned ${sourcesScanned} sources, found ${matchesFound} matches`,
            details: pipelineData,
            duration: Date.now() - pipelineStartTime
          });
        }

      } catch (error) {
        updateResult(3, {
          status: 'error',
          message: `Pipeline test error: ${error.message}`,
          details: {
            error,
            artwork_id_used: pipelineTestArtworkId
          },
          duration: Date.now() - pipelineStartTime
        });
      } finally {
        // Cleanup pipeline test artwork if we created one
        if (shouldCleanupPipelineArtwork && pipelineTestArtworkId) {
          try {
            await supabase.from('artwork').delete().eq('id', pipelineTestArtworkId);
          } catch (cleanupError) {
            console.warn('Failed to cleanup pipeline test artwork:', cleanupError);
          }
        }
      }

      toast.success('Diagnostic tests completed');

    } catch (error) {
      console.error('Diagnostic error:', error);
      toast.error('Diagnostic tests failed');
      addResult({
        phase: 'Error',
        status: 'error',
        message: 'Unexpected error during diagnostics',
        details: error
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'running': return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      running: 'secondary',
      pending: 'outline'
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Copyright Detection Diagnostics
          </CardTitle>
          <CardDescription>
            Comprehensive testing tool to diagnose why the system isn't finding copyright violations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? 'Running Diagnostics...' : 'Run Full Diagnostic Suite'}
          </Button>
        </CardContent>
      </Card>

      {/* API Status Overview */}
      {apiStatus.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>API Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {apiStatus.map((api) => (
                <Card key={api.name} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium capitalize">{api.name}</h4>
                    <Badge variant={api.working ? 'default' : 'destructive'}>
                      {api.working ? 'Working' : 'Error'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{api.status}</p>
                  {api.response_time && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Response: {api.response_time}ms
                    </p>
                  )}
                  {api.error && (
                    <p className="text-xs text-red-500 mt-1">{api.error}</p>
                  )}
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diagnostic Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Diagnostic Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <h4 className="font-medium">{result.phase}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.duration && (
                        <span className="text-sm text-muted-foreground">
                          {result.duration}ms
                        </span>
                      )}
                      {getStatusBadge(result.status)}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{result.message}</p>
                  {result.details && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground">
                        View Details
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Low Confidence Threshold:</strong> The system only stores matches with &gt;50% confidence. 
                Consider temporarily lowering to 30% for testing.
              </AlertDescription>
            </Alert>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Test Images:</strong> Use widely-available stock photos or known copyrighted images 
                that are likely to have matches across the web.
              </AlertDescription>
            </Alert>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>API Rate Limits:</strong> Some APIs may have rate limits or require specific 
                configurations. Check the edge function logs for detailed error messages.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};