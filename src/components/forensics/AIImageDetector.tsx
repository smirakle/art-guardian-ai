import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bot, Upload, Activity, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

interface AIDetectionResult {
  isAIGenerated: boolean;
  confidence: number;
  indicators: {
    frequencyAnomalies: number;
    pixelPatterns: number;
    metadataSignatures: number;
    stylometricAnalysis: number;
    neuralArtifacts: number;
  };
  detectionMethod: string;
  aiModel?: string;
  generationConfidence: number;
  artifacts: string[];
  technicalAnalysis: {
    compressionArtifacts: boolean;
    noisePatterns: string;
    colorSpace: string;
    frequencyDomain: string;
  };
}

const AIImageDetector: React.FC = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AIDetectionResult | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    console.log('[AIImageDetector] File uploaded:', selectedFile?.name, selectedFile?.type);
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    setFile(selectedFile);
    setImageUrl('');
    setResult(null);
    console.log('[AIImageDetector] File state set, imageUrl cleared');
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    setFile(null);
    setResult(null);
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const analyzeImage = async () => {
    if (!file && !imageUrl) {
      toast({
        title: 'No image provided',
        description: 'Please upload an image or provide a URL.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setResult(null);

    try {
      let imageData: string | undefined;
      let finalImageUrl: string | undefined;
      
      // If user uploaded a file, convert to base64 directly
      if (file) {
        console.log('Converting image to base64...');
        setProgress(10);
        
        imageData = await convertFileToBase64(file);
        console.log('Image converted to base64, length:', imageData.length);
        setProgress(30);
      } else {
        // User provided a URL
        finalImageUrl = imageUrl;
        setProgress(20);
      }

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      console.log('Calling AI detection function...');
      const { data, error } = await supabase.functions.invoke('ai-image-detector', {
        body: {
          imageUrl: finalImageUrl,
          imageData: imageData,
        },
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Function invocation failed');
      }

      if (!data || !data.result) {
        console.error('Invalid response:', data);
        throw new Error('Invalid response from detection service');
      }

      console.log('Analysis result:', data.result);
      setResult(data.result);
      
      toast({
        title: 'Analysis complete',
        description: `Detection confidence: ${Math.round(data.result.confidence * 100)}%`,
        variant: data.result.isAIGenerated ? 'destructive' : 'default',
      });

    } catch (error: any) {
      console.error('AI detection error:', error);
      toast({
        title: 'Analysis failed',
        description: error.message || 'Failed to analyze image',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-red-600';
    if (confidence >= 0.6) return 'text-orange-600';
    if (confidence >= 0.4) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getIndicatorLevel = (score: number) => {
    if (score >= 0.7) return 'High';
    if (score >= 0.4) return 'Medium';
    return 'Low';
  };

  const getIndicatorColor = (score: number) => {
    if (score >= 0.7) return 'destructive';
    if (score >= 0.4) return 'secondary';
    return 'outline';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Image Detection
        </CardTitle>
        <CardDescription>
          Analyze images to detect if they were generated by artificial intelligence
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload Image</Label>
              <Input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
              />
              {file && (
                <p className="text-sm text-muted-foreground">
                  Selected: {file.name}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image-url">Or Image URL</Label>
              <Input
                id="image-url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={handleUrlChange}
              />
            </div>
          </div>

          <Button 
            onClick={analyzeImage} 
            disabled={(!file && !imageUrl) || isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Activity className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Analyze for AI Generation
              </>
            )}
          </Button>

          {isAnalyzing && progress > 0 && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                Running AI detection analysis...
              </p>
            </div>
          )}
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Main Result */}
            <Card className={`${result.isAIGenerated ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {result.isAIGenerated ? (
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    ) : (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    )}
                    <div>
                      <h3 className={`font-semibold ${result.isAIGenerated ? 'text-red-900' : 'text-green-900'}`}>
                        {result.isAIGenerated ? 'AI Generated' : 'Likely Human Created'}
                      </h3>
                      <p className={`text-sm ${result.isAIGenerated ? 'text-red-700' : 'text-green-700'}`}>
                        Confidence: {Math.round(result.confidence * 100)}%
                      </p>
                    </div>
                  </div>
                  <Badge variant={result.isAIGenerated ? 'destructive' : 'default'}>
                    {result.detectionMethod}
                  </Badge>
                </div>
                {result.aiModel && (
                  <p className="mt-2 text-sm font-medium">
                    Suspected AI Model: {result.aiModel}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Detection Indicators */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detection Indicators</CardTitle>
                <CardDescription>
                  Individual analysis components and their scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Frequency Anomalies</span>
                      <Badge variant={getIndicatorColor(result.indicators.frequencyAnomalies)}>
                        {getIndicatorLevel(result.indicators.frequencyAnomalies)}
                      </Badge>
                    </div>
                    <Progress value={result.indicators.frequencyAnomalies * 100} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Pixel Patterns</span>
                      <Badge variant={getIndicatorColor(result.indicators.pixelPatterns)}>
                        {getIndicatorLevel(result.indicators.pixelPatterns)}
                      </Badge>
                    </div>
                    <Progress value={result.indicators.pixelPatterns * 100} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Metadata Signatures</span>
                      <Badge variant={getIndicatorColor(result.indicators.metadataSignatures)}>
                        {getIndicatorLevel(result.indicators.metadataSignatures)}
                      </Badge>
                    </div>
                    <Progress value={result.indicators.metadataSignatures * 100} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Style Analysis</span>
                      <Badge variant={getIndicatorColor(result.indicators.stylometricAnalysis)}>
                        {getIndicatorLevel(result.indicators.stylometricAnalysis)}
                      </Badge>
                    </div>
                    <Progress value={result.indicators.stylometricAnalysis * 100} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Neural Artifacts</span>
                      <Badge variant={getIndicatorColor(result.indicators.neuralArtifacts)}>
                        {getIndicatorLevel(result.indicators.neuralArtifacts)}
                      </Badge>
                    </div>
                    <Progress value={result.indicators.neuralArtifacts * 100} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detected Artifacts */}
            {result.artifacts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detected Artifacts</CardTitle>
                  <CardDescription>
                    Specific AI generation indicators found in the image
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.artifacts.map((artifact, index) => (
                      <Badge key={index} variant="outline">
                        {artifact.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Technical Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Technical Analysis</CardTitle>
                <CardDescription>
                  Low-level technical characteristics of the image
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Compression Artifacts:</span>
                      <Badge variant={result.technicalAnalysis.compressionArtifacts ? 'destructive' : 'default'}>
                        {result.technicalAnalysis.compressionArtifacts ? 'Present' : 'Normal'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Noise Patterns:</span>
                      <span className="text-sm font-medium">{result.technicalAnalysis.noisePatterns}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Color Space:</span>
                      <span className="text-sm font-medium">{result.technicalAnalysis.colorSpace}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Frequency Domain:</span>
                      <span className="text-sm font-medium">{result.technicalAnalysis.frequencyDomain}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIImageDetector;