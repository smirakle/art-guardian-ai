import { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useImageAnalysis } from "@/hooks/useImageAnalysis";
import { ImageAnalysis } from "@/types/visual-recognition";
import { supabase } from "@/integrations/supabase/client";
import UploadArea from "./visual-recognition/UploadArea";
import ImageAnalysisCard from "./visual-recognition/ImageAnalysisCard";
import RealTimeMonitoring from "./RealTimeMonitoring";
import { Eye, Camera, Shield } from "lucide-react";

const VisualRecognition = () => {
  const { toast } = useToast();
  const { analyzeImage } = useImageAnalysis();
  const [images, setImages] = useState<ImageAnalysis[]>([]);
  const [isInitializing, setIsInitializing] = useState(false);

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
      // Start visual analysis
      analyzeImage(image.file, startIndex + index, setImages);
      
      // Also create a monitoring scan for continuous protection
      try {
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          // Create temporary artwork record for quick analysis
          const tempArtwork = {
            title: `Quick Analysis - ${image.file.name}`,
            description: 'Temporary artwork for visual recognition analysis',
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
            // Create monitoring scan
            await supabase
              .from('monitoring_scans')
              .insert({
                artwork_id: artwork.id,
                scan_type: 'visual-recognition',
                status: 'running',
                started_at: new Date().toISOString(),
                total_sources: 50
              });
          }
        }
      } catch (error) {
        console.log('Could not create monitoring scan:', error);
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