import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAITPAEngine } from '@/hooks/useAITPAEngine';
import { 
  Brain, 
  Upload, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Fingerprint,
  Scan,
  Database,
  Activity
} from 'lucide-react';

export const AdvancedAIAnalysis: React.FC = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [fingerprint, setFingerprint] = useState<any>(null);
  const [datasetScanResult, setDatasetScanResult] = useState<any>(null);
  const { toast } = useToast();
  
  const { 
    isAnalyzing, 
    isComparing, 
    isScanning,
    analyzeWithAITPA, 
    generateFingerprint,
    scanDatasets,
    getThreatLevelColor,
    getThreatLevelIcon
  } = useAITPAEngine();

  const handleDeepAnalysis = useCallback(async () => {
    if (!imageUrl.trim()) {
      toast({
        title: "Missing URL",
        description: "Please enter an image URL to analyze.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Step 1: Run AITPA Analysis
      const analysis = await analyzeWithAITPA(imageUrl);
      if (analysis.success && analysis.result) {
        setAnalysisResult(analysis.result);
        
        // Step 2: Generate fingerprint
        const fingerprintResult = await generateFingerprint(imageUrl);
        if (fingerprintResult) {
          setFingerprint(fingerprintResult);
          
          // Step 3: Scan datasets for matches
          const scanResult = await scanDatasets(fingerprintResult.perceptualHash);
          if (scanResult) {
            setDatasetScanResult(scanResult);
          }
        }
        
        toast({
          title: "Analysis Complete",
          description: "Deep AI analysis has been completed successfully.",
        });
      }
    } catch (error) {
      console.error('Deep analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "An error occurred during the analysis. Please try again.",
        variant: "destructive",
      });
    }
  }, [imageUrl, analyzeWithAITPA, generateFingerprint, scanDatasets, toast]);

  const isLoading = isAnalyzing || isComparing || isScanning;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Advanced AI Analysis
          </CardTitle>
          <CardDescription>
            Production-ready AI analysis using AITPA engine for comprehensive threat detection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="imageUrl">Image URL for Analysis</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1"
                />
                <Button 
                  onClick={handleDeepAnalysis}
                  disabled={isLoading || !imageUrl.trim()}
                  className="px-6"
                >
                  {isLoading ? (
                    <Activity className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Scan className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? 'Analyzing...' : 'Run Deep Analysis'}
                </Button>
              </div>
            </div>

            {/* Progress Indicator */}
            {isLoading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Analysis Progress</span>
                  <span>
                    {isAnalyzing ? 'Running AITPA Analysis...' : 
                     isComparing ? 'Generating Fingerprint...' :
                     isScanning ? 'Scanning Datasets...' : 'Processing...'}
                  </span>
                </div>
                <Progress value={isAnalyzing ? 33 : isComparing ? 66 : 100} className="w-full" />
              </div>
            )}
          </div>

          {/* Results Section */}
          {(analysisResult || fingerprint || datasetScanResult) && (
            <Tabs defaultValue="analysis" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="analysis">AITPA Analysis</TabsTrigger>
                <TabsTrigger value="fingerprint">Digital Fingerprint</TabsTrigger>
                <TabsTrigger value="datasets">Dataset Scan</TabsTrigger>
              </TabsList>

              <TabsContent value="analysis" className="space-y-4">
                {analysisResult ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        AITPA Analysis Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Threat Level</Label>
                          <Badge className={getThreatLevelColor(analysisResult.threatLevel)}>
                            {getThreatLevelIcon(analysisResult.threatLevel)} {analysisResult.threatLevel.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <Label>Confidence Score</Label>
                          <div className="text-2xl font-bold">
                            {(analysisResult.confidence * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Risk Factors</Label>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Dataset Presence: {(analysisResult.riskFactors.datasetPresence * 100).toFixed(1)}%</div>
                          <div>Access Patterns: {(analysisResult.riskFactors.accessPatterns * 100).toFixed(1)}%</div>
                          <div>Technical Indicators: {(analysisResult.riskFactors.technicalIndicators * 100).toFixed(1)}%</div>
                          <div>Behavioral Anomalies: {(analysisResult.riskFactors.behavioralAnomalies * 100).toFixed(1)}%</div>
                        </div>
                      </div>

                      {analysisResult.indicators && analysisResult.indicators.length > 0 && (
                        <div className="space-y-2">
                          <Label>Threat Indicators</Label>
                          <div className="space-y-1">
                            {analysisResult.indicators.map((indicator: string, index: number) => (
                              <Badge key={index} variant="outline" className="mr-2">
                                {indicator}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Alert>
                    <Brain className="h-4 w-4" />
                    <AlertDescription>
                      Run analysis to see AITPA results here.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="fingerprint" className="space-y-4">
                {fingerprint ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Fingerprint className="h-5 w-5" />
                        Digital Fingerprint
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Perceptual Hash</Label>
                        <code className="block p-2 bg-muted rounded text-sm break-all">
                          {fingerprint.perceptualHash}
                        </code>
                      </div>
                      <div className="space-y-2">
                        <Label>Visual Signature</Label>
                        <code className="block p-2 bg-muted rounded text-sm break-all">
                          {fingerprint.visualSignature}
                        </code>
                      </div>
                      <div className="space-y-2">
                        <Label>Structural Features</Label>
                        <div className="text-sm text-muted-foreground">
                          {fingerprint.structuralFeatures.length} feature vectors extracted
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Alert>
                    <Fingerprint className="h-4 w-4" />
                    <AlertDescription>
                      Digital fingerprint will be generated during analysis.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="datasets" className="space-y-4">
                {datasetScanResult ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Dataset Scan Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{datasetScanResult.totalDatasets || 0}</div>
                          <div className="text-sm text-muted-foreground">Datasets Scanned</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-500">
                            {datasetScanResult.matches?.length || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">Potential Matches</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-500">
                            {datasetScanResult.highConfidenceMatches || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">High Confidence</div>
                        </div>
                      </div>

                      {datasetScanResult.matches && datasetScanResult.matches.length > 0 && (
                        <div className="space-y-2">
                          <Label>Dataset Matches</Label>
                          <div className="space-y-2">
                            {datasetScanResult.matches.map((match: any, index: number) => (
                              <div key={index} className="p-3 border rounded-lg">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="font-medium">{match.dataset}</div>
                                    <div className="text-sm text-muted-foreground">
                                      Confidence: {(match.confidence * 100).toFixed(1)}%
                                    </div>
                                  </div>
                                  <Badge variant={match.confidence > 0.8 ? "destructive" : "secondary"}>
                                    {match.confidence > 0.8 ? "High Risk" : "Medium Risk"}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Alert>
                    <Database className="h-4 w-4" />
                    <AlertDescription>
                      Dataset scan results will appear here after analysis.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>
          )}

          {/* Sample Images for Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sample Images for Testing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setImageUrl('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800')}
                >
                  <Eye className="h-3 w-3 mr-2" />
                  Test Portrait
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setImageUrl('https://images.unsplash.com/photo-1596815064285-45ed8a9c0463?w=800')}
                >
                  <Eye className="h-3 w-3 mr-2" />
                  Test Artwork
                </Button>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};