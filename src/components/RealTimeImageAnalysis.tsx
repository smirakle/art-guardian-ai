import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Search, 
  Shield, 
  Eye, 
  Upload,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Globe
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface AnalysisResult {
  type: string;
  service: string;
  results: any[];
  confidence: number;
  timestamp: string;
}

interface RealTimeAnalysisState {
  isAnalyzing: boolean;
  progress: number;
  results: AnalysisResult[];
  currentStep: string;
}

export const RealTimeImageAnalysis = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [analysisState, setAnalysisState] = useState<RealTimeAnalysisState>({
    isAnalyzing: false,
    progress: 0,
    results: [],
    currentStep: ''
  });
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setImageUrl(url);
        toast({
          title: "Image Selected",
          description: "Ready for real-time analysis with live APIs"
        });
      } else {
        toast({
          title: "Invalid File",
          description: "Please select an image file",
          variant: "destructive"
        });
      }
    }
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    const fileName = `${user.id}/${Date.now()}_${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('artwork')
      .upload(fileName, file);

    if (error) throw error;

    const { data: publicUrl } = supabase.storage
      .from('artwork')
      .getPublicUrl(fileName);

    return publicUrl.publicUrl;
  };

  const performRealTimeAnalysis = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to perform analysis",
        variant: "destructive"
      });
      return;
    }

    if (!imageUrl && !selectedFile) {
      toast({
        title: "No Image Selected",
        description: "Please select or provide an image URL",
        variant: "destructive"
      });
      return;
    }

    setAnalysisState({
      isAnalyzing: true,
      progress: 0,
      results: [],
      currentStep: 'Preparing image...'
    });

    try {
      let finalImageUrl = imageUrl;

      // Upload file if selected
      if (selectedFile) {
        setAnalysisState(prev => ({ ...prev, currentStep: 'Uploading image to secure storage...', progress: 10 }));
        finalImageUrl = await uploadImageToSupabase(selectedFile);
      }

      setAnalysisState(prev => ({ ...prev, currentStep: 'Initializing AI analysis engines...', progress: 20 }));

      // Simulate realistic progress updates for better UX
      const progressSteps = [
        { step: 'Connecting to OpenAI GPT-4o Vision...', progress: 25 },
        { step: 'Starting TinEye reverse image search...', progress: 35 },
        { step: 'Querying Google visual search API...', progress: 45 },
        { step: 'Scanning Bing visual database...', progress: 55 },
        { step: 'Analyzing copyright databases...', progress: 65 },
        { step: 'Processing similarity algorithms...', progress: 75 },
        { step: 'Compiling results from all sources...', progress: 85 }
      ];

      // Update progress with realistic timing
      let currentProgressIndex = 0;
      const progressInterval = setInterval(() => {
        if (currentProgressIndex < progressSteps.length) {
          const { step, progress } = progressSteps[currentProgressIndex];
          setAnalysisState(prev => ({ ...prev, currentStep: step, progress }));
          currentProgressIndex++;
        } else {
          clearInterval(progressInterval);
        }
      }, 1200);

      // Perform real-time analysis using all available services
      const { data, error } = await supabase.functions.invoke('realtime-image-analysis', {
        body: {
          imageUrl: finalImageUrl,
          analysisTypes: ['classification', 'reverse_search', 'copyright', 'similarity'],
          userId: user.id
        }
      });

      clearInterval(progressInterval);

      if (error) throw error;

      setAnalysisState(prev => ({ ...prev, currentStep: 'Analysis complete!', progress: 100 }));

      // Wait a moment to show completion
      setTimeout(() => {
        setAnalysisState({
          isAnalyzing: false,
          progress: 100,
          results: data.results || [],
          currentStep: 'Ready for new analysis'
        });

        const totalResults = data.results?.reduce((sum: number, result: AnalysisResult) => 
          sum + result.results.length, 0) || 0;

        toast({
          title: "🎯 Real-Time Analysis Complete",
          description: `Found ${totalResults} results across ${data.results?.length || 0} analysis engines using live APIs`,
        });
      }, 1000);

    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisState(prev => ({ ...prev, isAnalyzing: false }));
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : 'Failed to analyze image with real APIs',
        variant: "destructive"
      });
    }
  };

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case 'classification': return <Brain className="h-4 w-4" />;
      case 'reverse_search': return <Search className="h-4 w-4" />;
      case 'copyright': return <Shield className="h-4 w-4" />;
      case 'similarity': return <Eye className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-6 w-6" />
            Real-Time Visual Recognition
          </CardTitle>
          <CardDescription>
            Live AI-powered image analysis using OpenAI GPT-4o, TinEye, Google, Bing, and copyright databases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {imageUrl ? (
              <div className="space-y-4">
                <img 
                  src={imageUrl} 
                  alt="Selected for analysis" 
                  className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                />
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setImageUrl('');
                      setSelectedFile(null);
                      setAnalysisState({ isAnalyzing: false, progress: 0, results: [], currentStep: '' });
                    }}
                  >
                    Clear Image
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium">Drop an image here or click to upload</p>
                  <p className="text-sm text-muted-foreground">Supports JPG, PNG, WebP (max 10MB)</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <Button variant="outline" className="cursor-pointer">
                    Select Image
                  </Button>
                </label>
              </div>
            )}
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Or enter image URL:</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Analysis Button */}
          <Button
            onClick={performRealTimeAnalysis}
            disabled={analysisState.isAnalyzing || (!imageUrl && !selectedFile)}
            className="w-full"
            size="lg"
          >
            {analysisState.isAnalyzing ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Analyzing with Live APIs...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Start Real-Time Analysis
              </>
            )}
          </Button>

          {/* Progress */}
          {analysisState.isAnalyzing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{analysisState.currentStep}</span>
                <span>{analysisState.progress}%</span>
              </div>
              <Progress value={analysisState.progress} className="w-full" />
              <div className="text-xs text-muted-foreground text-center">
                Using real APIs: OpenAI, TinEye, Google, Bing, SerpAPI
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {analysisState.results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Live Analysis Results
            </CardTitle>
            <CardDescription>
              Real-world results from {analysisState.results.length} live analysis engines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="classification" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="classification">AI Classification</TabsTrigger>
                <TabsTrigger value="reverse_search">Reverse Search</TabsTrigger>
                <TabsTrigger value="copyright">Copyright Check</TabsTrigger>
                <TabsTrigger value="similarity">Similarity</TabsTrigger>
              </TabsList>

              {analysisState.results.map((result) => (
                <TabsContent key={result.type} value={result.type} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getAnalysisIcon(result.type)}
                      <h3 className="text-lg font-semibold capitalize">{result.type.replace('_', ' ')}</h3>
                      <Badge variant="outline">{result.service}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${getConfidenceColor(result.confidence)}`}>
                        {Math.round(result.confidence * 100)}% confidence
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(result.timestamp)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {result.results.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No matches found in {result.service} database</p>
                        <p className="text-sm">This could indicate original content</p>
                      </div>
                    ) : (
                      result.results.slice(0, 10).map((item, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <h4 className="font-medium">
                                {item.title || item.analysis || item.description || 'Result'}
                              </h4>
                              {item.url && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span>{item.source || item.domain || 'Unknown source'}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(item.url, '_blank')}
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                              <div className="flex gap-2 flex-wrap">
                                {item.confidence && (
                                  <Badge variant="secondary">
                                    {Math.round(item.confidence * 100)}% match
                                  </Badge>
                                )}
                                {item.copyright_risk && (
                                  <Badge variant={getRiskBadgeVariant(item.copyright_risk)}>
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    {item.copyright_risk} risk
                                  </Badge>
                                )}
                                {item.similarity_score && (
                                  <Badge variant="outline">
                                    {Math.round(item.similarity_score * 100)}% similar
                                  </Badge>
                                )}
                                {item.match_type && (
                                  <Badge variant="outline">
                                    {item.match_type.replace('_', ' ')}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {item.thumbnail && (
                              <img 
                                src={item.thumbnail} 
                                alt="Match thumbnail"
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealTimeImageAnalysis;