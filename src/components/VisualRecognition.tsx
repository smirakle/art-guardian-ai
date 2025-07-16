import { useState, useCallback, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useImageAnalysis } from "@/hooks/useImageAnalysis";
import { ImageAnalysis } from "@/types/visual-recognition";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import UploadArea from "./visual-recognition/UploadArea";
import ImageAnalysisCard from "./visual-recognition/ImageAnalysisCard";
import RealTimeMonitoring from "./RealTimeMonitoring";
import BlockchainVerification from "./BlockchainVerification";
import UserGuidance from "./UserGuidance";
import { watermarkService, InvisibleWatermark } from "@/lib/watermark";
import { Eye, Camera, Shield, HelpCircle, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const VisualRecognition = () => {
  const { toast } = useToast();
  const { analyzeImage } = useImageAnalysis();
  const { user } = useAuth();
  const [images, setImages] = useState<ImageAnalysis[]>([]);
  const [isInitializing, setIsInitializing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'analyze' | 'monitor'>('upload');
  const [showGuidance, setShowGuidance] = useState(true);

  const handleUrlUpload = async (url: string) => {
    const supportedDomains = [
      'youtube.com', 'youtu.be', 'm.youtube.com',
      'tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com',
      'instagram.com', 'instagr.am',
      'facebook.com', 'fb.watch', 'm.facebook.com',
      'twitter.com', 'x.com', 't.co'
    ];
    
    const validateUrl = (url: string): boolean => {
      try {
        const urlObj = new URL(url);
        return supportedDomains.some(domain => urlObj.hostname.includes(domain));
      } catch {
        return false;
      }
    };

    if (!validateUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube, TikTok, Instagram, Facebook, or X video link",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to upload content",
          variant: "destructive",
        });
        return;
      }

      // Create artwork record for URL
      const urlArtwork = {
        title: `Video Link - ${new URL(url).hostname}`,
        description: `Video content from ${url}`,
        category: 'video',
        user_id: user.id,
        file_paths: [url], // Store the URL as a file path
        status: 'monitoring'
      };

      const { data: artwork, error: artworkError } = await supabase
        .from('artwork')
        .insert(urlArtwork)
        .select()
        .single();

      if (artworkError) {
        throw artworkError;
      }

      // Create a URL-based analysis entry using a dummy file
      const dummyFile = new File([url], 'video-link.url', {
        type: 'text/plain'
      });

      const urlAnalysis: ImageAnalysis = {
        file: dummyFile,
        preview: url,
        results: [],
        isAnalyzing: true,
        progress: 0
      };

      setImages(prev => [...prev, urlAnalysis]);

      // Simulate analysis for URL
      setTimeout(() => {
        setImages(prev => prev.map(img => 
          img.preview === url 
            ? {
                ...img,
                results: [
                  { 
                    type: 'classification',
                    label: 'Video Link',
                    confidence: 95,
                    description: 'Social media video link detected',
                    riskLevel: 'low' as const,
                    suggestions: ['Monitor for unauthorized use', 'Enable notifications for matches']
                  },
                  {
                    type: 'similarity',
                    label: 'Social Media Content',
                    confidence: 88,
                    description: 'Content suitable for monitoring across platforms',
                    riskLevel: 'medium' as const,
                    suggestions: ['Set up comprehensive monitoring', 'Check usage rights']
                  }
                ],
                isAnalyzing: false,
                progress: 100
              }
            : img
        ));
      }, 2000);

      // Create monitoring scan for the URL with proper artwork ID
      await supabase.from('monitoring_scans').insert({
        artwork_id: artwork.id,
        scan_type: 'url',
        status: 'running',
        started_at: new Date().toISOString(),
        total_sources: 1000
      });

      toast({
        title: "Video Link Added",
        description: "Video link has been added for analysis and monitoring",
      });

    } catch (error) {
      console.error('Error processing URL:', error);
      toast({
        title: "Error",
        description: "Failed to process video link",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upload files",
        variant: "destructive",
      });
      return;
    }

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

    // Start analyzing each image and create monitoring scan
    const startIndex = images.length;
    newImages.forEach(async (image, index) => {
      try {
        // Apply invisible watermarking for enhanced detection
        const watermarkId = InvisibleWatermark.generateWatermarkId(user.id);
        const watermarkedBlob = await watermarkService.applyWatermark(image.file, {
          text: watermarkId,
          opacity: 0.02,
          frequency: 'medium',
          position: 'center'
        });

        // Convert watermarked blob back to file for analysis
        const watermarkedFile = new File([watermarkedBlob], image.file.name, {
          type: image.file.type,
          lastModified: Date.now()
        });

        // Update the image with watermarked version
        setImages(prev => prev.map((img, idx) => 
          idx === startIndex + index 
            ? { 
                ...img, 
                file: watermarkedFile,
                watermarkId,
                isWatermarked: true
              }
            : img
        ));

        // Start visual analysis with watermarked image
        analyzeImage(watermarkedFile, startIndex + index, setImages);
        
        // Create proper artwork record for monitoring
        const artwork = {
          title: `${image.file.name} (Enhanced)`,
          description: 'Artwork with invisible watermark for enhanced detection',
          category: 'digital',
          user_id: user.id,
          file_paths: [], // Will be populated if uploaded to storage
          status: 'monitoring',
          enable_watermark: true,
          enable_blockchain: false
        };

        const { data: artworkData, error: artworkError } = await supabase
          .from('artwork')
          .insert(artwork)
          .select()
          .single();

        if (artworkError) {
          throw artworkError;
        }

        if (artworkData) {
          // Create monitoring scan with enhanced detection
          await supabase
            .from('monitoring_scans')
            .insert({
              artwork_id: artworkData.id,
              scan_type: 'visual-recognition-enhanced',
              status: 'running',
              started_at: new Date().toISOString(),
              total_sources: 2500 // Increased sources for enhanced detection
            });
        }

        toast({
          title: "Enhanced Protection Applied",
          description: `Invisible watermark applied to ${image.file.name} for better detection`,
        });

      } catch (error) {
        console.log('Could not create monitoring scan or apply watermark:', error);
        
        // Fallback to regular analysis without watermark
        analyzeImage(image.file, startIndex + index, setImages);
        
        // Create basic artwork record even if watermarking fails
        try {
          const basicArtwork = {
            title: image.file.name,
            description: 'Standard artwork protection',
            category: 'digital',
            user_id: user.id,
            file_paths: [],
            status: 'monitoring',
            enable_watermark: false,
            enable_blockchain: false
          };

          const { data: artworkData } = await supabase
            .from('artwork')
            .insert(basicArtwork)
            .select()
            .single();

          if (artworkData) {
            await supabase
              .from('monitoring_scans')
              .insert({
                artwork_id: artworkData.id,
                scan_type: 'visual-recognition',
                status: 'running',
                started_at: new Date().toISOString(),
                total_sources: 1000
              });
          }
        } catch (fallbackError) {
          console.error('Fallback artwork creation failed:', fallbackError);
        }
        
        toast({
          title: "Standard Analysis Applied",
          description: "Continuing with standard protection (watermarking failed)",
          variant: "destructive",
        });
      }
    });
  }, [images.length, analyzeImage, toast]);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {showGuidance && (
          <UserGuidance 
            currentStep={currentStep} 
            onDismiss={() => setShowGuidance(false)}
            showWelcome={images.length === 0}
          />
        )}

        <Tabs defaultValue="quick-analysis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="quick-analysis" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Quick Analysis</span>
              <span className="sm:hidden">Analyze</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3 h-3 ml-1 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upload and analyze your content for protection</p>
                </TooltipContent>
              </Tooltip>
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Real-Time Monitoring</span>
              <span className="sm:hidden">Monitor</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3 h-3 ml-1 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>View live monitoring of your protected content</p>
                </TooltipContent>
              </Tooltip>
            </TabsTrigger>
            <TabsTrigger value="blockchain" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">Blockchain Verification</span>
              <span className="sm:hidden">Blockchain</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3 h-3 ml-1 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create immutable blockchain certificates for your artwork</p>
                </TooltipContent>
              </Tooltip>
            </TabsTrigger>
            <TabsTrigger value="existing" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Protected Content</span>
              <span className="sm:hidden">Protected</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3 h-3 ml-1 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Manage your existing protected artwork</p>
                </TooltipContent>
              </Tooltip>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quick-analysis" className="space-y-6">
            <UploadArea 
              onFileUpload={handleFileUpload}
              onUrlUpload={handleUrlUpload}
              isInitializing={isInitializing}
              isEmpty={images.length === 0}
            />

            {images.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {images.map((image, index) => (
                  <ImageAnalysisCard 
                    key={index} 
                    image={image} 
                    index={index} 
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <RealTimeMonitoring />
          </TabsContent>

          <TabsContent value="blockchain" className="space-y-6">
            <BlockchainVerification />
          </TabsContent>

          <TabsContent value="existing" className="space-y-6">
            <RealTimeMonitoring />
          </TabsContent>
        </Tabs>

        {!showGuidance && (
          <div className="text-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowGuidance(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Show Help
            </Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default VisualRecognition;