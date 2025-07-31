import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Upload, Search, Scan, Info, ShoppingCart, MapPin, Languages, Copy, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DetectedObject {
  id: string;
  type: 'product' | 'text' | 'landmark' | 'plant' | 'animal' | 'object';
  label: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  interactionData?: {
    productInfo?: {
      title: string;
      price: string;
      store: string;
      url: string;
    };
    textInfo?: {
      content: string;
      language: string;
      translatedText?: string;
    };
    landmarkInfo?: {
      name: string;
      location: string;
      description: string;
    };
  };
}

interface AnalysisResult {
  objects: DetectedObject[];
  overallContext: string;
  suggestions: string[];
  processingTime: number;
}

const GoogleLensInterface = () => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedObject, setSelectedObject] = useState<DetectedObject | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [overlayPoints, setOverlayPoints] = useState<Array<{ x: number; y: number; id: string }>>([]);

  // Initialize camera stream
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Use back camera on mobile
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      toast({
        title: "Camera Access Required",
        description: "Please allow camera access to use live detection",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  // Capture image from video stream
  const captureImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  // Handle image analysis
  const analyzeImage = useCallback(async (imageData: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setOverlayPoints([]);
    
    try {
      const startTime = Date.now();
      
      // Call Google Lens-style analysis function
      const { data: result, error } = await supabase.functions.invoke('google-lens-analysis', {
        body: {
          imageData,
          analysisTypes: ['objects', 'text', 'products', 'landmarks']
        }
      });

      if (error) throw error;

      const processingTime = Date.now() - startTime;
      const analysisResult: AnalysisResult = {
        objects: result.objects || [],
        overallContext: result.overallContext || 'Image analyzed successfully',
        suggestions: result.suggestions || ['Tap on detected elements for more information'],
        processingTime
      };

      setAnalysisResult(analysisResult);
      
      // Create overlay points for detected objects
      const points = analysisResult.objects.map(obj => ({
        x: obj.boundingBox.x + obj.boundingBox.width / 2,
        y: obj.boundingBox.y + obj.boundingBox.height / 2,
        id: obj.id
      }));
      setOverlayPoints(points);

      toast({
        title: "Analysis Complete",
        description: `Found ${analysisResult.objects.length} objects in ${processingTime}ms`,
      });

    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  // Handle live capture and analysis
  const handleLiveCapture = useCallback(async () => {
    const imageData = await captureImage();
    if (imageData) {
      setCurrentImage(imageData);
      await analyzeImage(imageData);
    }
  }, [captureImage, analyzeImage]);

  // Handle file upload
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      setCurrentImage(imageData);
      stopCamera(); // Stop camera when analyzing uploaded image
      await analyzeImage(imageData);
    };
    reader.readAsDataURL(file);
  }, [analyzeImage, stopCamera]);

  // Handle overlay point clicks
  const handleOverlayClick = useCallback((point: { x: number; y: number; id: string }) => {
    const object = analysisResult?.objects.find(obj => obj.id === point.id);
    if (object) {
      setSelectedObject(object);
    }
  }, [analysisResult]);

  // Get icon for object type
  const getObjectIcon = (type: DetectedObject['type']) => {
    switch (type) {
      case 'product': return ShoppingCart;
      case 'text': return Languages;
      case 'landmark': return MapPin;
      default: return Info;
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <TooltipProvider>
      <div className="w-full max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AI Visual Intelligence
          </h1>
          <p className="text-muted-foreground">
            Point, click, and discover. Google Lens-style visual analysis and real-time object detection.
          </p>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera/Image View */}
          <div className="lg:col-span-2">
            <Card className="relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  {/* Video Stream */}
                  {isStreaming && (
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      playsInline
                      muted
                    />
                  )}
                  
                  {/* Static Image */}
                  {currentImage && !isStreaming && (
                    <img
                      src={currentImage}
                      alt="Analysis target"
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Overlay Points */}
                  {overlayPoints.map((point) => (
                    <button
                      key={point.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-primary/90 rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform z-10"
                      style={{
                        left: `${point.x}%`,
                        top: `${point.y}%`,
                      }}
                      onClick={() => handleOverlayClick(point)}
                    >
                      <Zap className="w-4 h-4 text-white mx-auto" />
                    </button>
                  ))}

                  {/* Analysis Overlay */}
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-center text-white space-y-3">
                        <Scan className="w-12 h-12 animate-spin mx-auto" />
                        <p className="text-lg font-medium">Analyzing Image...</p>
                        <p className="text-sm opacity-75">Detecting objects, text, and products</p>
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {!isStreaming && !currentImage && !isAnalyzing && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white space-y-4">
                        <Camera className="w-16 h-16 mx-auto opacity-50" />
                        <p className="text-lg">Ready for Visual Analysis</p>
                        <p className="text-sm opacity-75">Start camera or upload an image</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="p-4 bg-card border-t border-border/50">
                  <div className="flex items-center justify-center gap-3">
                    {!isStreaming ? (
                      <>
                        <Button
                          onClick={startCamera}
                          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Start Camera
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Image
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={handleLiveCapture}
                          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                          disabled={isAnalyzing}
                        >
                          <Search className="w-4 h-4 mr-2" />
                          Analyze
                        </Button>
                        <Button variant="outline" onClick={stopCamera}>
                          Stop Camera
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="space-y-4">
            {/* Selected Object Details */}
            {selectedObject && (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const Icon = getObjectIcon(selectedObject.type);
                        return <Icon className="w-5 h-5 text-primary" />;
                      })()}
                      <span className="font-medium">{selectedObject.label}</span>
                    </div>
                    <Badge variant="secondary">
                      {selectedObject.confidence.toFixed(1)}%
                    </Badge>
                  </div>

                  {/* Product Information */}
                  {selectedObject.interactionData?.productInfo && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Product Details</h4>
                      <div className="space-y-1 text-sm">
                        <p className="font-medium">{selectedObject.interactionData.productInfo.title}</p>
                        <p className="text-primary font-semibold">{selectedObject.interactionData.productInfo.price}</p>
                        <p className="text-muted-foreground">{selectedObject.interactionData.productInfo.store}</p>
                        <Button size="sm" className="w-full mt-2">
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          View Product
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Text Information */}
                  {selectedObject.interactionData?.textInfo && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Detected Text</h4>
                      <div className="space-y-2">
                        <p className="text-sm bg-muted p-2 rounded">{selectedObject.interactionData.textInfo.content}</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Languages className="w-3 h-3 mr-1" />
                            Translate
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Landmark Information */}
                  {selectedObject.interactionData?.landmarkInfo && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Landmark Details</h4>
                      <div className="space-y-1 text-sm">
                        <p className="font-medium">{selectedObject.interactionData.landmarkInfo.name}</p>
                        <p className="text-muted-foreground">{selectedObject.interactionData.landmarkInfo.location}</p>
                        <p className="text-sm">{selectedObject.interactionData.landmarkInfo.description}</p>
                        <Button size="sm" className="w-full mt-2">
                          <MapPin className="w-3 h-3 mr-1" />
                          Get Directions
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Analysis Results Summary */}
            {analysisResult && (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Analysis Results</h3>
                    <Badge variant="outline">
                      {analysisResult.objects.length} objects
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {analysisResult.overallContext}
                  </p>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Detected Objects:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {analysisResult.objects.map((obj) => {
                        const Icon = getObjectIcon(obj.type);
                        return (
                          <Tooltip key={obj.id}>
                            <TooltipTrigger asChild>
                              <button
                                className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                                onClick={() => setSelectedObject(obj)}
                              >
                                <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                                <span className="text-sm truncate">{obj.label}</span>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{obj.confidence.toFixed(1)}% confidence</p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Analysis completed in {analysisResult.processingTime}ms
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Hidden Canvas for Image Capture */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </TooltipProvider>
  );
};

export default GoogleLensInterface;