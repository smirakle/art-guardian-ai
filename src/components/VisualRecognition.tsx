import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useImageAnalysis } from "@/hooks/useImageAnalysis";
import { ImageAnalysis, AnalysisResult } from "@/types/visual-recognition";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import UploadArea from "./visual-recognition/UploadArea";
import ImageAnalysisCard from "./visual-recognition/ImageAnalysisCard";
import RealTimeMonitoring from "./RealTimeMonitoring";
import EnhancedMonitoringOverview from "./monitoring/EnhancedMonitoringOverview";
import { useArtworkLimit } from "@/hooks/useArtworkLimit";
import { ArtworkLimitIndicator } from "./artwork/ArtworkLimitIndicator";

import { watermarkService, InvisibleWatermark } from "@/lib/watermark";
import { enhancedWatermarkService, EnhancedWatermarkOptions, EnhancedWatermarkSystem } from "@/lib/enhancedWatermark";
import { Eye, Camera, Shield, Brain, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";

const VisualRecognition = () => {
  const { toast } = useToast();
  const { analyzeImage } = useImageAnalysis();
  const { user } = useAuth();
  const { checkLimit, refreshStatus, canUpload, remainingSlots } = useArtworkLimit();
  const [images, setImages] = useState<ImageAnalysis[]>([]);
  const [isInitializing, setIsInitializing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'analyze' | 'monitor'>('upload');
  const [showGuidance, setShowGuidance] = useState(true);

  // --- All business logic handlers unchanged ---
  const handleTakeProtectionAction = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: "Authentication Required", description: "Please sign in to start protection", variant: "destructive" }); return; }
    toast({ title: "Protection Started", description: "Applying enhanced security measures..." });
    setTimeout(() => { toast({ title: "Protection Applied", description: "Your content is now under enhanced monitoring" }); }, 2000);
  }, [toast]);

  const handleTextUpload = async (text: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast({ title: "Authentication Required", description: "Please sign in to upload content", variant: "destructive" }); return; }
      const limitStatus = await checkLimit(1);
      if (!limitStatus.canUpload) { toast({ title: "Upload Limit Reached", description: limitStatus.message, variant: "destructive" }); return; }
      const textArtwork = { title: `Text Content - ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`, description: text, category: 'text', user_id: user.id, file_paths: [], status: 'monitoring' };
      const { data: artwork, error: artworkError } = await supabase.from('artwork').insert(textArtwork).select().single();
      if (artworkError) throw artworkError;
      const dummyFile = new File([text], 'text-content.txt', { type: 'text/plain' });
      const textAnalysis: ImageAnalysis = { file: dummyFile, preview: text, results: [], isAnalyzing: true, progress: 0 };
      setImages(prev => [...prev, textAnalysis]);
      setTimeout(() => {
        setImages(prev => prev.map(img => img.preview === text ? { ...img, results: [
          { type: 'classification', label: 'Text Content', confidence: 92, description: 'Original text content detected and analyzed', riskLevel: 'low' as const, suggestions: ['Monitor for plagiarism', 'Track unauthorized usage', 'Enable real-time scanning'] },
          { type: 'similarity', label: 'Content Uniqueness', confidence: 87, description: 'Text analyzed for originality and potential duplicates', riskLevel: 'medium' as const, suggestions: ['Set up plagiarism detection', 'Monitor academic databases', 'Track web usage'] }
        ], isAnalyzing: false, progress: 100 } : img));
      }, 2000);
      await supabase.from('monitoring_scans').insert({ artwork_id: artwork.id, scan_type: 'text', status: 'running', started_at: new Date().toISOString(), total_sources: 5000 });
      toast({ title: "Text Content Added", description: "Text content has been added for analysis and monitoring" });
    } catch (error) { console.error('Error processing text:', error); toast({ title: "Error", description: "Failed to process text content", variant: "destructive" }); }
  };

  const handleUrlUpload = async (url: string) => {
    const validateUrl = (url: string): boolean => { try { const u = new URL(url); return u.protocol === 'http:' || u.protocol === 'https:'; } catch { return false; } };
    if (!validateUrl(url)) { toast({ title: "Invalid URL", description: "Please enter a valid HTTP or HTTPS URL", variant: "destructive" }); return; }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast({ title: "Authentication Required", description: "Please sign in to upload content", variant: "destructive" }); return; }
      const limitStatus = await checkLimit(1);
      if (!limitStatus.canUpload) { toast({ title: "Upload Limit Reached", description: limitStatus.message, variant: "destructive" }); return; }
      const hostname = new URL(url).hostname;
      const isVideoContent = ['youtube.com', 'youtu.be', 'tiktok.com', 'instagram.com', 'facebook.com', 'twitter.com', 'x.com'].some(d => hostname.includes(d));
      const urlArtwork = { title: `${isVideoContent ? 'Video' : 'Article'} - ${hostname}`, description: `${isVideoContent ? 'Video' : 'Article'} content from ${url}`, category: isVideoContent ? 'video' : 'article', user_id: user.id, file_paths: [url], status: 'monitoring' };
      const { data: artwork, error: artworkError } = await supabase.from('artwork').insert(urlArtwork).select().single();
      if (artworkError) throw artworkError;
      const dummyFile = new File([url], 'video-link.url', { type: 'text/plain' });
      const urlAnalysis: ImageAnalysis = { file: dummyFile, preview: url, results: [], isAnalyzing: true, progress: 0 };
      setImages(prev => [...prev, urlAnalysis]);
      setTimeout(async () => {
        try {
          const { data: analysisResult, error: analysisError } = await supabase.functions.invoke('analyze-article-content', { body: { url, artworkId: artwork.id } });
          if (analysisError) console.error('Article analysis error:', analysisError);
          const analysis = analysisResult?.analysis;
          const results: AnalysisResult[] = analysis ? [
            { type: 'classification' as const, label: analysis.contentType || (isVideoContent ? 'Video Link' : 'Article Content'), confidence: analysis.confidence || 95, description: analysis.title || (isVideoContent ? 'Social media video link detected' : 'Online article or web content detected'), riskLevel: (analysis.copyrightRisk || 'low') as 'low' | 'medium' | 'high', suggestions: analysis.suggestions || ['Monitor for unauthorized use', 'Enable notifications for matches', 'Track content plagiarism'] },
            { type: 'similarity' as const, label: `Content Analysis (${analysis.wordCount || 0} words)`, confidence: Math.min(analysis.confidence || 88, 95), description: `${analysis.quality || 'medium'} quality content with ${analysis.readingTime || 1} min reading time`, riskLevel: (analysis.copyrightRisk || 'medium') as 'low' | 'medium' | 'high', suggestions: analysis.suggestions?.slice(0, 3) || ['Set up comprehensive monitoring', 'Check usage rights', 'Monitor for content scraping'] }
          ] : [{ type: 'classification' as const, label: isVideoContent ? 'Video Link' : 'Article Content', confidence: 95, description: isVideoContent ? 'Social media video link detected' : 'Online article or web content detected', riskLevel: 'low' as const, suggestions: ['Monitor for unauthorized use', 'Enable notifications for matches', 'Track content plagiarism'] }];
          setImages(prev => prev.map(img => img.preview === url ? { ...img, results, isAnalyzing: false, progress: 100 } : img));
        } catch (error) {
          console.error('Error during article analysis:', error);
          setImages(prev => prev.map(img => img.preview === url ? { ...img, results: [{ type: 'classification' as const, label: isVideoContent ? 'Video Link' : 'Article Content', confidence: 95, description: isVideoContent ? 'Social media video link detected' : 'Online article or web content detected', riskLevel: 'low' as const, suggestions: ['Monitor for unauthorized use', 'Enable notifications for matches', 'Track content plagiarism'] }], isAnalyzing: false, progress: 100 } : img));
        }
      }, 2000);
      await supabase.from('monitoring_scans').insert({ artwork_id: artwork.id, scan_type: 'url', status: 'running', started_at: new Date().toISOString(), total_sources: 1000 });
      toast({ title: `${isVideoContent ? 'Video' : 'Article'} Link Added`, description: `Content has been added for analysis and monitoring` });
    } catch (error) { console.error('Error processing URL:', error); toast({ title: "Error", description: "Failed to process video link", variant: "destructive" }); }
  };

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: "Authentication Required", description: "Please sign in to upload files", variant: "destructive" }); return; }
    const limitStatus = await checkLimit(files.length);
    if (!limitStatus.canUpload) { toast({ title: "Upload Limit Reached", description: limitStatus.message, variant: "destructive" }); return; }
    const newImages: ImageAnalysis[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) { toast({ title: "Invalid File", description: "Please upload only image files", variant: "destructive" }); continue; }
      const preview = URL.createObjectURL(file);
      newImages.push({ file, preview, results: [], isAnalyzing: false, progress: 0 });
    }
    setImages(prev => [...prev, ...newImages]);
    const startIndex = images.length;
    newImages.forEach(async (image, index) => {
      try {
        const watermarkId = EnhancedWatermarkSystem.generateWatermarkId(user.id);
        const defaultWatermarkOptions: EnhancedWatermarkOptions = { type: 'invisible', protectionLevel: 'standard', text: watermarkId };
        const watermarkedBlob = await enhancedWatermarkService.applyWatermark(image.file, defaultWatermarkOptions);
        const watermarkedFile = new File([watermarkedBlob], image.file.name, { type: image.file.type, lastModified: Date.now() });
        const artworkId = `temp-${Date.now()}-${index}`;
        setImages(prev => prev.map((img, idx) => idx === startIndex + index ? { ...img, file: watermarkedFile, isWatermarked: true, watermarkId, artworkId } : img));
        analyzeImage(watermarkedFile, startIndex + index, setImages);
        const fileName = `${user.id}/${Date.now()}_${image.file.name}`;
        const { error: uploadError } = await supabase.storage.from('artwork').upload(fileName, watermarkedFile, { cacheControl: '3600', upsert: false });
        if (uploadError) throw uploadError;
        const artwork = { title: `${image.file.name} (Enhanced)`, description: 'Artwork with invisible watermark for enhanced detection', category: 'digital', user_id: user.id, file_paths: [fileName], status: 'monitoring', enable_watermark: true, enable_blockchain: false };
        const { data: artworkData, error: artworkError } = await supabase.from('artwork').insert(artwork).select().single();
        if (artworkError) throw artworkError;
        if (artworkData) {
          await supabase.from('monitoring_scans').insert({ artwork_id: artworkData.id, scan_type: 'visual-recognition', status: 'running', started_at: new Date().toISOString(), total_sources: 2500 });
          try {
            const { data: deepfakeResult, error: deepfakeError } = await supabase.functions.invoke('deepfake-scan-upload', { body: { filePath: fileName, fileName: image.file.name, artworkId: artworkData.id } });
            if (deepfakeError) console.error('Deepfake detection error:', deepfakeError);
            else if (deepfakeResult?.isDeepfake) toast({ title: "⚠️ Deepfake Detected", description: `Potential manipulation detected in ${image.file.name} (${deepfakeResult.confidence}% confidence)`, variant: "destructive" });
          } catch (e) { console.error('Deepfake detection exception:', e); }
        }
        toast({ title: "Enhanced Protection Applied", description: `Invisible watermark applied to ${image.file.name}` });
      } catch (error) {
        console.log('Watermark/upload error:', error);
        analyzeImage(image.file, startIndex + index, setImages);
        try {
          const fileName = `${user.id}/${Date.now()}_${image.file.name}`;
          const { error: uploadError } = await supabase.storage.from('artwork').upload(fileName, image.file, { cacheControl: '3600', upsert: false });
          const basicArtwork = { title: image.file.name, description: 'Standard artwork protection', category: 'digital', user_id: user.id, file_paths: uploadError ? [] : [fileName], status: 'monitoring', enable_watermark: false, enable_blockchain: false };
          const { data: artworkData } = await supabase.from('artwork').insert(basicArtwork).select().single();
          if (artworkData) {
            await supabase.from('monitoring_scans').insert({ artwork_id: artworkData.id, scan_type: 'visual-recognition', status: 'running', started_at: new Date().toISOString(), total_sources: 1000 });
            if (!uploadError) {
              try {
                const { data: deepfakeResult, error: deepfakeError } = await supabase.functions.invoke('deepfake-scan-upload', { body: { filePath: fileName, fileName: image.file.name, artworkId: artworkData.id } });
                if (deepfakeError) console.error('Deepfake detection error (fallback):', deepfakeError);
                else if (deepfakeResult?.isDeepfake) toast({ title: "⚠️ Deepfake Detected", description: `Potential manipulation in ${image.file.name}`, variant: "destructive" });
              } catch (e) { console.error('Fallback deepfake exception:', e); }
            }
          }
        } catch (fallbackError) { console.error('Fallback artwork creation failed:', fallbackError); }
        toast({ title: "Standard Analysis Applied", description: "Continuing with standard protection", variant: "destructive" });
      }
    });
    refreshStatus();
  }, [images.length, analyzeImage, toast, checkLimit, refreshStatus]);

  const tabs = [
    { value: 'quick-analysis', label: 'Quick Analysis', shortLabel: 'Analyze', icon: Camera },
    { value: 'monitoring', label: 'Real-Time Monitoring', shortLabel: 'Monitor', icon: Eye },
    { value: 'enhanced', label: 'Enhanced Monitoring', shortLabel: 'Enhanced', icon: Brain },
    { value: 'existing', label: 'Protected Content', shortLabel: 'Protected', icon: Shield },
  ];

  return (
    <Card className="border bg-card/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
            <Scan className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-base">Visual Recognition & Analysis</h3>
            <p className="text-xs text-muted-foreground">AI-powered content analysis, watermarking, and monitoring</p>
          </div>
        </div>
      </div>

      <CardContent className="p-0">
        <Tabs defaultValue="quick-analysis" className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-muted/50 p-1 rounded-xl h-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="rounded-lg py-2.5 text-xs font-medium data-[state=active]:shadow-md data-[state=active]:bg-background transition-all gap-1.5"
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <TabsContent value="quick-analysis" className="px-6 pb-6 pt-4 space-y-6 animate-fade-in">
            <ArtworkLimitIndicator className="p-4 rounded-xl bg-muted/30 border" />
            <UploadArea
              onFileUpload={handleFileUpload}
              onUrlUpload={handleUrlUpload}
              onTextUpload={handleTextUpload}
              isInitializing={isInitializing}
              isEmpty={images.length === 0}
            />
            {images.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {images.map((image, index) => (
                  <ImageAnalysisCard key={index} image={image} index={index} onTakeProtectionAction={handleTakeProtectionAction} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="monitoring" className="px-6 pb-6 pt-4 animate-fade-in">
            <RealTimeMonitoring />
          </TabsContent>

          <TabsContent value="enhanced" className="px-6 pb-6 pt-4 animate-fade-in">
            <EnhancedMonitoringOverview />
          </TabsContent>

          <TabsContent value="existing" className="px-6 pb-6 pt-4 animate-fade-in">
            <RealTimeMonitoring />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VisualRecognition;
