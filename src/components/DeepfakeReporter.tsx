import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  Eye, 
  Upload, 
  Link, 
  MapPin, 
  Clock, 
  Shield, 
  CheckCircle,
  Brain,
  FileImage,
  Loader
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DeepfakeAnalysis {
  isDeepfake: boolean;
  confidence: number;
  manipulation_type: string;
  threat_level: string;
  facial_artifacts: string[];
  temporal_inconsistency: boolean;
}

const DeepfakeReporter = () => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DeepfakeAnalysis | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [claimedLocation, setClaimedLocation] = useState('');
  const [claimedTime, setClaimedTime] = useState('');
  const [description, setDescription] = useState('');
  const [progress, setProgress] = useState(0);

  const handleAnalyze = async () => {
    if (!imageUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter an image URL to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setAnalysis(null);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 15, 90));
      }, 500);

      console.log('Starting deepfake analysis...');
      
      const { data: result, error } = await supabase.functions.invoke('deepfake-detector', {
        body: {
          imageUrl: imageUrl.trim(),
          claimedLocation: claimedLocation.trim() || undefined,
          claimedTime: claimedTime.trim() || undefined,
          description: description.trim() || undefined
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) {
        console.error('Deepfake detection error:', error);
        
        // Handle specific error types
        if (error.message?.includes('Daily limit exceeded') || error.message?.includes('429')) {
          toast({
            title: "Daily Limit Reached",
            description: "You've reached your daily scan limit of 50. Resets in 24 hours.",
            variant: "destructive",
          });
        } else if (error.message?.includes('Authentication')) {
          toast({
            title: "Authentication Required",
            description: "Please sign in to use deepfake detection.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Analysis Failed",
            description: error.message || "Unable to analyze the image. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      console.log('Deepfake analysis result:', result);
      setAnalysis(result.analysis);

      const remainingText = result.remaining_scans !== undefined 
        ? ` (${result.remaining_scans} scans remaining today)`
        : '';

      toast({
        title: "Analysis Complete",
        description: result.analysis.isDeepfake 
          ? `Potential ${result.analysis.manipulation_type} detected with ${Math.round(result.analysis.confidence * 100)}% confidence${remainingText}`
          : `No deepfake manipulation detected${remainingText}`,
        variant: result.analysis.isDeepfake ? "destructive" : "default",
      });

    } catch (error) {
      console.error('Deepfake analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze image",
        variant: "destructive",
      });
      setProgress(0);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    toast({
      title: "File Upload",
      description: "File upload feature coming soon. Please use image URL for now.",
    });
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'text-red-600';
    if (confidence > 0.5) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <CardTitle className="flex items-center gap-2">
                Deepfake & Media Manipulation Detector
              </CardTitle>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
          </div>
          <CardDescription>
            Advanced AI analysis to detect deepfakes, face swaps, and manipulated content claiming false origins
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="imageUrl"
                    placeholder="Enter image URL to analyze"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={isAnalyzing}
                  />
                  <Button variant="outline" size="icon" disabled={isAnalyzing}>
                    <Link className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Or upload an image file</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={isAnalyzing}
                />
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={isAnalyzing}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="claimedLocation" className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Claimed Location (Optional)
                </Label>
                <Input
                  id="claimedLocation"
                  placeholder="Enter claimed location"
                  value={claimedLocation}
                  onChange={(e) => setClaimedLocation(e.target.value)}
                  disabled={isAnalyzing}
                />
              </div>

              <div>
                <Label htmlFor="claimedTime" className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Claimed Time/Date (Optional)
                </Label>
                <Input
                  id="claimedTime"
                  placeholder="Enter claimed time/date"
                  value={claimedTime}
                  onChange={(e) => setClaimedTime(e.target.value)}
                  disabled={isAnalyzing}
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Additional Context (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe where you found this image and why you suspect it might be manipulated..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isAnalyzing}
              className="mt-1"
            />
          </div>

          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader className="h-4 w-4 animate-spin" />
                <span className="text-sm">Analyzing image for deepfake manipulation...</span>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-muted-foreground">
                {progress < 30 && "Scanning for facial artifacts..."}
                {progress >= 30 && progress < 60 && "Analyzing metadata and temporal consistency..."}
                {progress >= 60 && progress < 90 && "Performing reverse image search verification..."}
                {progress >= 90 && "Finalizing analysis..."}
              </p>
            </div>
          )}

          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing}
            className="w-full bg-gradient-to-r from-primary to-accent"
          >
            {isAnalyzing ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Analyze Image
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <Card className={`border-2 ${analysis.isDeepfake ? 'border-red-200 bg-red-50 dark:bg-red-950/20' : 'border-green-200 bg-green-50 dark:bg-green-950/20'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {analysis.isDeepfake ? (
                <>
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Manipulation Detected
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  No Manipulation Detected
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Confidence Level:</span>
                  <span className={`font-bold ${getConfidenceColor(analysis.confidence)}`}>
                    {Math.round(analysis.confidence * 100)}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Threat Level:</span>
                  <Badge variant={getThreatColor(analysis.threat_level || 'low')}>
                    {(analysis.threat_level || 'low').toUpperCase()}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Manipulation Type:</span>
                  <span className="text-sm text-muted-foreground">
                    {analysis.manipulation_type}
                  </span>
                </div>

                {analysis.temporal_inconsistency && (
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      Temporal inconsistency detected - claimed time/location doesn't match image metadata
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-3">
                {analysis.facial_artifacts.length > 0 && (
                  <div>
                    <span className="text-sm font-medium">Detected Artifacts:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {analysis.facial_artifacts.map((artifact, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {artifact}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {imageUrl && (
                  <div className="mt-4">
                    <span className="text-sm font-medium">Analyzed Image:</span>
                    <div className="mt-2 border rounded-lg overflow-hidden">
                      <img 
                        src={imageUrl} 
                        alt="Analyzed content" 
                        className="w-full max-h-48 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {analysis.isDeepfake && (
              <Alert className="mt-4">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recommendation:</strong> This content shows signs of manipulation. 
                  Verify with original sources before sharing. Consider reporting to platform moderators 
                  if this content is being used to spread misinformation.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Detection Methods:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• AI facial artifact analysis</li>
                <li>• Temporal consistency checking</li>
                <li>• Metadata forensics</li>
                <li>• Reverse image verification</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Monitored Platforms:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Surface web (2M+ sources)</li>
                <li>• Dark web monitoring</li>
                <li>• Social media platforms</li>
                <li>• Anonymous forums</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeepfakeReporter;