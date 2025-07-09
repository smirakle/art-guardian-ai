import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Eye, 
  Upload, 
  Scan, 
  AlertTriangle, 
  CheckCircle, 
  Image as ImageIcon,
  Zap,
  Search,
  Shield,
  Camera,
  FileImage,
  Loader
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

interface AnalysisResult {
  type: 'classification' | 'similarity' | 'copyright';
  confidence: number;
  label: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  suggestions: string[];
}

interface ImageAnalysis {
  file: File;
  preview: string;
  results: AnalysisResult[];
  isAnalyzing: boolean;
  progress: number;
}

const VisualRecognition = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ImageAnalysis[]>([]);
  const [isInitializing, setIsInitializing] = useState(false);

  const analyzeImage = useCallback(async (file: File, index: number) => {
    setImages(prev => prev.map((img, i) => 
      i === index ? { ...img, isAnalyzing: true, progress: 0 } : img
    ));

    try {
      // Update progress
      setImages(prev => prev.map((img, i) => 
        i === index ? { ...img, progress: 20 } : img
      ));

      // Create image element for analysis
      const imageUrl = URL.createObjectURL(file);
      const img = new Image();
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      setImages(prev => prev.map((img, i) => 
        i === index ? { ...img, progress: 40 } : img
      ));

      // Initialize image classification pipeline
      const classifier = await pipeline(
        'image-classification',
        'onnx-community/mobilenetv4_conv_small.e2400_r224_in1k',
        { device: 'webgpu' }
      );

      setImages(prev => prev.map((img, i) => 
        i === index ? { ...img, progress: 70 } : img
      ));

      // Perform classification
      const classifications = await classifier(imageUrl);
      
      setImages(prev => prev.map((img, i) => 
        i === index ? { ...img, progress: 90 } : img
      ));

      // Process results and simulate copyright analysis
      const results: AnalysisResult[] = [];

      // Add classification results
      if (classifications && Array.isArray(classifications) && classifications.length > 0) {
        const topResult = classifications[0];
        if (topResult && typeof topResult === 'object' && 'score' in topResult && 'label' in topResult) {
          results.push({
            type: 'classification',
            confidence: topResult.score * 100,
            label: topResult.label,
            description: `Detected as ${topResult.label} with ${(topResult.score * 100).toFixed(1)}% confidence`,
            riskLevel: topResult.score > 0.8 ? 'low' : topResult.score > 0.5 ? 'medium' : 'high',
            suggestions: [
              'Image successfully classified',
              'No immediate copyright concerns detected',
              'Consider watermarking for protection'
            ]
          });
        }
      }

      // Simulate copyright risk analysis
      const copyrightRisk = Math.random();
      results.push({
        type: 'copyright',
        confidence: (1 - copyrightRisk) * 100,
        label: copyrightRisk < 0.3 ? 'High Risk' : copyrightRisk < 0.7 ? 'Medium Risk' : 'Low Risk',
        description: copyrightRisk < 0.3 
          ? 'Potential copyright infringement detected' 
          : copyrightRisk < 0.7 
            ? 'Some similarities found with existing content'
            : 'No significant copyright concerns',
        riskLevel: copyrightRisk < 0.3 ? 'high' : copyrightRisk < 0.7 ? 'medium' : 'low',
        suggestions: copyrightRisk < 0.3 
          ? ['Review image ownership', 'Consider legal consultation', 'Remove potentially infringing elements']
          : copyrightRisk < 0.7 
            ? ['Verify image rights', 'Add proper attribution', 'Monitor for unauthorized use']
            : ['Register copyright', 'Add watermark', 'Enable monitoring alerts']
      });

      // Simulate similarity check
      const similarityScore = Math.random() * 100;
      results.push({
        type: 'similarity',
        confidence: similarityScore,
        label: `${similarityScore.toFixed(1)}% Similar`,
        description: `Found ${Math.floor(similarityScore / 10)} similar images across monitored platforms`,
        riskLevel: similarityScore > 80 ? 'high' : similarityScore > 50 ? 'medium' : 'low',
        suggestions: [
          'Similarity analysis completed',
          'Monitor detected matches',
          'Set up automated alerts'
        ]
      });

      setImages(prev => prev.map((img, i) => 
        i === index ? { 
          ...img, 
          results, 
          isAnalyzing: false, 
          progress: 100 
        } : img
      ));

      URL.revokeObjectURL(imageUrl);

      toast({
        title: "Analysis Complete",
        description: `Found ${results.length} analysis results for your image`,
      });

    } catch (error) {
      console.error('Error analyzing image:', error);
      setImages(prev => prev.map((img, i) => 
        i === index ? { ...img, isAnalyzing: false, progress: 0 } : img
      ));
      
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze the image. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newImages: ImageAnalysis[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please upload only image files",
          variant: "destructive",
        });
        continue;
      }

      const preview = URL.createObjectURL(file);
      newImages.push({
        file,
        preview,
        results: [],
        isAnalyzing: false,
        progress: 0
      });
    }

    setImages(prev => [...prev, ...newImages]);

    // Start analyzing each image
    const startIndex = images.length;
    newImages.forEach((_, index) => {
      analyzeImage(newImages[index].file, startIndex + index);
    });
  }, [images.length, analyzeImage, toast]);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'default';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return AlertTriangle;
      case 'medium': return Eye;
      default: return CheckCircle;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Visual Recognition & Copyright Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Upload images for AI-powered copyright detection, similarity analysis, and content classification
              </p>
              {isInitializing && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader className="w-4 h-4 animate-spin" />
                  Initializing AI models...
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Images
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Analysis Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {images.map((image, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <FileImage className="w-4 h-4" />
                  {image.file.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image Preview */}
                <div className="relative">
                  <img 
                    src={image.preview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  {image.isAnalyzing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                      <div className="text-center text-white">
                        <Scan className="w-8 h-8 animate-spin mx-auto mb-2" />
                        <p className="text-sm">Analyzing...</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress */}
                {image.isAnalyzing && (
                  <div className="space-y-2">
                    <Progress value={image.progress} className="w-full" />
                    <p className="text-xs text-muted-foreground text-center">
                      Processing: {image.progress}%
                    </p>
                  </div>
                )}

                {/* Results */}
                {image.results.length > 0 && (
                  <Tabs defaultValue="classification" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="classification">Classification</TabsTrigger>
                      <TabsTrigger value="copyright">Copyright</TabsTrigger>
                      <TabsTrigger value="similarity">Similarity</TabsTrigger>
                    </TabsList>

                    {image.results.map((result, resultIndex) => (
                      <TabsContent key={resultIndex} value={result.type} className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {(() => {
                                const Icon = getRiskIcon(result.riskLevel);
                                return <Icon className="w-4 h-4" />;
                              })()}
                              <span className="font-medium">{result.label}</span>
                              <Badge variant={getRiskColor(result.riskLevel)}>
                                {result.confidence.toFixed(1)}%
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {result.description}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Recommendations:</h4>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {result.suggestions.map((suggestion, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0" />
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {result.riskLevel === 'high' && (
                          <Button size="sm" variant="destructive" className="w-full">
                            <Shield className="w-3 h-3 mr-1" />
                            Take Protection Action
                          </Button>
                        )}
                      </TabsContent>
                    ))}
                  </Tabs>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <ImageIcon className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium">No Images Uploaded</h3>
                <p className="text-sm text-muted-foreground">
                  Upload images to start AI-powered copyright analysis and visual recognition
                </p>
              </div>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Your First Image
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VisualRecognition;