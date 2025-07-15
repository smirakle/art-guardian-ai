import { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useImageAnalysis } from "@/hooks/useImageAnalysis";
import { ImageAnalysis } from "@/types/visual-recognition";
import { supabase } from "@/integrations/supabase/client";
import UploadArea from "./visual-recognition/UploadArea";
import ImageAnalysisCard from "./visual-recognition/ImageAnalysisCard";
import RealTimeMonitoring from "./RealTimeMonitoring";
import { watermarkService, InvisibleWatermark } from "@/lib/watermark";
import { Eye, Camera, Shield } from "lucide-react";

const VisualRecognition = () => {
  const { toast } = useToast();
  const { analyzeImage } = useImageAnalysis();
  const [images, setImages] = useState<ImageAnalysis[]>([]);
  const [isInitializing, setIsInitializing] = useState(false);

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
      if (!user) return;

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

      // Create monitoring scan for the URL
      await supabase.from('monitoring_scans').insert({
        artwork_id: crypto.randomUUID(),
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
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        // Apply invisible watermarking for enhanced detection
        const watermarkId = InvisibleWatermark.generateWatermarkId(user.user.id);
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
        
        // Create temporary artwork record for quick analysis
        const tempArtwork = {
          title: `Quick Analysis - ${image.file.name} (Enhanced)`,
          description: 'Temporary artwork with invisible watermark for enhanced detection',
          category: 'digital',
          user_id: user.user.id,
          file_paths: [], // Will be empty for quick analysis
          status: 'analyzing'
        };

        const { data: artwork } = await supabase
          .from('artwork')
          .insert(tempArtwork)
          .select()
          .single();

        if (artwork) {
          // Create monitoring scan with enhanced detection
          await supabase
            .from('monitoring_scans')
            .insert({
              artwork_id: artwork.id,
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
        
        toast({
          title: "Standard Analysis Applied",
          description: "Continuing with standard protection (watermarking failed)",
          variant: "destructive",
        });
      }
    });
  }, [images.length, analyzeImage, toast]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="quick-analysis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quick-analysis" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Quick Analysis
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Real-Time Monitoring
          </TabsTrigger>
          <TabsTrigger value="existing" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Monitor Existing Art
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

        <TabsContent value="existing" className="space-y-6">
          <RealTimeMonitoring />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VisualRecognition;