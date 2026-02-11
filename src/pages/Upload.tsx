import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload as UploadIcon, 
  Image, 
  FileText, 
  Shield, 
  CheckCircle,
  AlertTriangle,
  Plus,
  X,
  Camera,
  FolderOpen,
  Link,
  Info,
  Brain,
  Activity,
  Globe,
  ChevronDown,
  Eye,
  Sparkles
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePerformanceBudget } from "@/hooks/usePerformanceBudget";
import { useMonitoredSupabaseCall } from "@/hooks/useMonitoredSupabaseCall";
import { MonitoringWrapper } from "@/components/MonitoringWrapper";

import { supabase } from "@/integrations/supabase/client";
import VisualRecognition from "@/components/VisualRecognition";
import { AdvancedWatermarkProtection } from "@/components/AdvancedWatermarkProtection";
import { WatermarkResult } from "@/lib/advancedWatermark";
import { UserGuide } from "@/components/UserGuide";
import { uploadGuide } from "@/data/userGuides";
import { BugReportButton } from "@/components/BugReportButton";
import ImprovedUploadGuidance from "@/components/ImprovedUploadGuidance";
import C2PAProtection from "@/components/ai-protection/C2PAProtection";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
  status: 'uploading' | 'processing' | 'protected' | 'error';
  progress: number;
}

const Upload = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { measureApiCall, measureDatabaseQuery } = usePerformanceBudget({
    apiCall: 3000, // 3s for file uploads
    databaseQuery: 500,
  });
  const { invokeFunction, query } = useMonitoredSupabaseCall();
  
  // Authentication is optional for viewing, required for protecting
  
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [artworkTitle, setArtworkTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [licenseType, setLicenseType] = useState("");
  const [enableWatermark, setEnableWatermark] = useState(true);
  const [isProtecting, setIsProtecting] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const [rawFiles, setRawFiles] = useState<File[]>([]);
  const [watermarkResults, setWatermarkResults] = useState<WatermarkResult[]>([]);
  
  // Progress tracking
  const [currentStep, setCurrentStep] = useState<'select' | 'upload' | 'analyze' | 'monitor'>('select');
  const [completedTabs, setCompletedTabs] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("upload");
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
    }
  };

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      // Allow all valid HTTP/HTTPS URLs for articles and other content
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const addUrl = () => {
    if (urlInput.trim() && !urls.includes(urlInput.trim())) {
      if (validateUrl(urlInput.trim())) {
        setUrls([...urls, urlInput.trim()]);
        setUrlInput("");
        toast({
          title: "URL Added", 
          description: "Article or content link has been added for protection",
        });
      } else {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid HTTP or HTTPS URL",
          variant: "destructive",
        });
      }
    }
  };

  const removeUrl = (urlToRemove: string) => {
    setUrls(urls.filter(url => url !== urlToRemove));
  };

  const processFiles = async (fileList: File[]) => {
    setRawFiles(prev => [...prev, ...fileList]);
    setCurrentStep('upload');
    
    for (const file of fileList) {
      const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0
      };

      // Create preview for images and videos
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, preview: e.target?.result as string } : f
          ));
        };
        reader.readAsDataURL(file);
      }

      setFiles(prev => [...prev, newFile]);

      // Upload to Supabase storage
      await uploadFile(file, fileId);
    }
  };

  const uploadFile = async (file: File, fileId: string) => {
    try {
      // Create file path - use anonymous user ID if no user logged in
      const userId = user?.id || 'anonymous';
      const fileName = `${userId}/${Date.now()}-${file.name}`;
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('artwork')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Update file status to processing
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'processing', progress: 100 } : f
      ));
      
      setCurrentStep('analyze');

      // Simulate processing time
      setTimeout(() => {
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'protected' } : f
        ));
        
        setCompletedTabs(prev => new Set(prev).add('upload'));
        
        toast({
          title: "File Uploaded",
          description: `${file.name} has been uploaded successfully`,
        });
      }, 1000);

    } catch (error: any) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'error' } : f
      ));
      
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    }
  };

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Simulate processing phase
        setTimeout(() => {
          setFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, status: 'processing', progress: 0 } : f
          ));
          
          // Simulate processing completion
          setTimeout(() => {
            setFiles(prev => prev.map(f => 
              f.id === fileId ? { ...f, status: 'protected', progress: 100 } : f
            ));
            
            toast({
              title: "Artwork Protected",
              description: "Your artwork is now being monitored 24/7",
            });
          }, 2000);
        }, 1000);
      }
      
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, progress } : f
      ));
    }, 200);
  };

  const removeFile = async (fileId: string) => {
    const fileToRemove = files.find(f => f.id === fileId);
    
    // Remove from local state
    setFiles(prev => prev.filter(f => f.id !== fileId));
    
    // If file was uploaded to storage, delete it
    if (fileToRemove && fileToRemove.status === 'protected') {
      try {
        const userId = user?.id || 'anonymous';
        const fileName = `${userId}/${Date.now()}-${fileToRemove.name}`;
        const { error } = await supabase.storage
          .from('artwork')
          .remove([fileName]);
          
        if (error) {
          console.error('Error deleting file from storage:', error);
        } else {
          toast({
            title: "File Removed",
            description: `${fileToRemove.name} has been deleted`,
          });
        }
      } catch (error) {
        console.error('Error removing file:', error);
      }
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return <UploadIcon className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'processing':
        return <Shield className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case 'protected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'Processing & Securing...';
      case 'protected':
        return 'Protected & Monitored';
      case 'error':
        return 'Upload Failed';
    }
  };

  const handleStartProtection = async () => {
    // Show summary first
    if (!showSummary) {
      setShowSummary(true);
      return;
    }
    
    // Validation
    if (files.length === 0 && urls.length === 0) {
      toast({
        title: "No Content Selected",
        description: "Please upload at least one file or add a social media account to protect",
        variant: "destructive",
      });
      return;
    }

    if (!artworkTitle.trim()) {
      toast({
        title: "Missing Title",
        description: "Please provide a title for your artwork",
        variant: "destructive",
      });
      return;
    }

    if (!category) {
      toast({
        title: "Missing Category",
        description: "Please select a category for your artwork",
        variant: "destructive",
      });
      return;
    }

    setIsProtecting(true);
    setCurrentStep('monitor');

    try {
      // Show initial toast
      toast({
        title: "Protection Started",
        description: "Your artwork protection process has begun",
      });

      // Update files to processing status
      const protectedFiles = files.map(file => ({ 
        ...file, 
        status: 'processing' as const,
        progress: 50 
      }));
      setFiles(protectedFiles);

      // Get file paths from uploaded files and URLs
      const userId = user?.id || 'anonymous';
      const filePaths = files.map(file => `${userId}/${Date.now()}-${file.name}`);
      const allPaths = [...filePaths, ...urls];

      // Create artwork record in database (only if user is authenticated)
      let artwork = null;
      if (user) {
        const { data: artworkData, error: artworkError } = await supabase
          .from('artwork')
          .insert({
            user_id: user.id,
            title: artworkTitle,
            description: description || null,
            category,
            tags: tags.length > 0 ? tags : null,
            license_type: licenseType || null,
            file_paths: allPaths,
            enable_watermark: enableWatermark,
            status: 'protected'
          })
          .select()
          .single();

        if (artworkError) {
          throw artworkError;
        }
        artwork = artworkData;
      }

      // Start monitoring scan for the artwork (only if user is authenticated)
      if (user && artwork) {
        const { data: scan, error: scanError } = await supabase
        .from('monitoring_scans')
        .insert({
          artwork_id: artwork.id,
          scan_type: 'deep',
          status: 'pending',
          total_sources: 52000
        })
        .select()
        .single();

        if (scanError) {
          console.error('Scan creation error:', scanError);
        } else if (scan) {
          // Start the monitoring scan in the background
          console.log('Starting monitoring scan for:', scan.id, artwork.id);
          try {
            console.log('Invoking edge function process-monitoring-scan...');
            const { data, error } = await supabase.functions.invoke('process-monitoring-scan', {
              body: {
                scanId: scan.id,
                artworkId: artwork.id
              }
            });
            
            if (error) {
              console.error('Edge function invocation error:', error);
              console.error('Error details:', JSON.stringify(error, null, 2));
            } else {
              console.log('Edge function invoked successfully:', data);
            }
          } catch (scanProcessError) {
            console.error('Exception during edge function call:', scanProcessError);
            console.error('Exception details:', JSON.stringify(scanProcessError, null, 2));
          }
        }
      }

      // Update to protected status
      const finalFiles = files.map(file => ({ 
        ...file, 
        status: 'protected' as const,
        progress: 100 
      }));
      setFiles(finalFiles);

      // Success notification
      const totalItems = files.length + urls.length;
      
      setCompletedTabs(prev => new Set(prev).add('upload').add('analyze'));
      
      toast({
        title: "Protection Complete!",
        description: `${totalItems} item(s) are now protected and being monitored 24/7`,
      });

      console.log("Protection applied with:", {
        artworkId: artwork.id,
        title: artworkTitle,
        category,
        description,
        tags,
        licenseType,
        watermark: enableWatermark,
        files: files.length
      });

    } catch (error: any) {
      console.error('Protection error:', error);
      toast({
        title: "Protection Failed",
        description: error.message || "There was an error protecting your artwork. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProtecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Upload & Protect
            </h1>
            <UserGuide 
              title={uploadGuide.title}
              description={uploadGuide.description}
              sections={uploadGuide.sections}
            />
            </div>
            <p className="text-lg md:text-xl text-muted-foreground mb-6">
              Upload your creative work to start AI-powered protection
            </p>
            
            {/* Consolidated Alert */}
            <Alert className="mb-4 border-primary/20 bg-primary/5">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription>
                {!user ? (
                  <>
                    <span className="font-medium">Free Access:</span> You can upload and protect artwork without signing in. 
                    Sign in for full features like monitoring and alerts. 
                  </>
                ) : (
                  <>
                    <span className="font-medium">Pro Tip:</span> Visit the <strong>Dashboard</strong> after uploading for advanced monitoring features.
                  </>
                )}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Progress Stepper */}
        <div className="mb-6">
          <ImprovedUploadGuidance currentStep={currentStep} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="upload" className="flex flex-col gap-1 py-3 relative">
              <div className="flex items-center gap-2">
                <UploadIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Step 1: Upload</span>
                <span className="sm:hidden">Upload</span>
                {completedTabs.has('upload') && (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                )}
              </div>
              <span className="text-xs text-muted-foreground hidden sm:block">Select and upload files</span>
            </TabsTrigger>
            <TabsTrigger value="watermark" className="flex flex-col gap-1 py-3 relative">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Step 2: Watermark</span>
                <span className="sm:hidden">Watermark</span>
                {completedTabs.has('watermark') && (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                )}
              </div>
              <span className="text-xs text-muted-foreground hidden sm:block">Apply protection</span>
            </TabsTrigger>
            <TabsTrigger value="analyze" className="flex flex-col gap-1 py-3 relative">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Step 3: Analyze</span>
                <span className="sm:hidden">Analyze</span>
                {completedTabs.has('analyze') && (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                )}
              </div>
              <span className="text-xs text-muted-foreground hidden sm:block">Visual recognition</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Upload Area - Enhanced */}
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UploadIcon className="h-5 w-5 text-primary" />
                    Upload Files
                    {files.length > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {files.length} files
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Drag and drop files or click to select. All formats supported.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                      isDragging 
                        ? 'border-primary bg-primary/10 scale-[1.02]' 
                        : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className={`transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`}>
                      <FolderOpen className={`mx-auto h-12 w-12 mb-4 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      Drop files here or click to upload
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Supports images, videos, audio, documents, and more
                    </p>
                    <Input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                    />
                    <Button asChild size="lg" className="hover:scale-105 transition-transform">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Camera className="h-4 w-4 mr-2" />
                        Select Files
                      </label>
                    </Button>
                  </div>

                  {/* Add URL Section */}
                  <div className="mt-6 p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Link className="h-4 w-4" />
                      Add URLs
                    </h4>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter article or content URL"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addUrl()}
                      />
                      <Button onClick={addUrl} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {urls.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {urls.map((url, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-background rounded animate-fade-in">
                            <span className="text-sm flex items-center gap-2 truncate">
                              <Link className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{url}</span>
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeUrl(url)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Metadata Form - With Progressive Disclosure */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Artwork Details
                  </CardTitle>
                  <CardDescription>
                    Provide information about your creative work
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Essential Fields - Always Visible */}
                  <div className="space-y-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Essential Information
                    </h4>
                    
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        placeholder="Enter artwork title"
                        value={artworkTitle}
                        onChange={(e) => setArtworkTitle(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="photography">Photography</SelectItem>
                          <SelectItem value="digital-art">Digital Art</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="audio">Audio/Music</SelectItem>
                          <SelectItem value="writing">Writing</SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Optional Fields - Collapsible */}
                  <Collapsible open={showOptionalFields} onOpenChange={setShowOptionalFields}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between">
                        <span className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Optional Details
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${showOptionalFields ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe your artwork"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={3}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Tags</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            placeholder="Add tags"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addTag()}
                          />
                          <Button onClick={addTag} size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="cursor-pointer hover:bg-destructive/80 transition-colors" onClick={() => removeTag(tag)}>
                                {tag} <X className="h-3 w-3 ml-1" />
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="license">License Type</Label>
                        <Select value={licenseType} onValueChange={setLicenseType}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select license" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all-rights-reserved">All Rights Reserved</SelectItem>
                            <SelectItem value="cc-by">Creative Commons BY</SelectItem>
                            <SelectItem value="cc-by-sa">Creative Commons BY-SA</SelectItem>
                            <SelectItem value="cc-by-nc">Creative Commons BY-NC</SelectItem>
                            <SelectItem value="public-domain">Public Domain</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Protection Options */}
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      Protection Options
                    </h4>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="watermark"
                        checked={enableWatermark}
                        onCheckedChange={(checked) => setEnableWatermark(checked === true)}
                      />
                      <Label htmlFor="watermark" className="cursor-pointer">Enable Watermarking</Label>
                    </div>
                  </div>

                  {/* Summary Section */}
                  {showSummary && (files.length > 0 || urls.length > 0) && (
                    <div className="p-4 rounded-lg bg-accent/10 border-2 border-accent/50 animate-fade-in">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        Ready to Protect
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Files:</span>
                          <span className="font-medium">{files.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">URLs:</span>
                          <span className="font-medium">{urls.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Category:</span>
                          <span className="font-medium capitalize">{category || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Watermark:</span>
                          <span className="font-medium">{enableWatermark ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full mt-3"
                        onClick={() => setShowSummary(false)}
                      >
                        Edit Details
                      </Button>
                    </div>
                  )}

                  <Button 
                    onClick={handleStartProtection} 
                    disabled={isProtecting || (files.length === 0 && urls.length === 0)}
                    className="w-full"
                    size="lg"
                  >
                    {isProtecting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Protecting...
                      </>
                    ) : showSummary ? (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Confirm & Protect
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Review & Protect ({files.length + urls.length} items)
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Uploaded Files ({files.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {file.preview && (
                            <div className="w-12 h-12 rounded overflow-hidden bg-muted">
                              <img 
                                src={file.preview} 
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(file.size)} • {getStatusText(file.status)}
                            </p>
                            {file.status === 'uploading' && (
                              <Progress value={file.progress} className="w-32 mt-1" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(file.status)}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFile(file.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="watermark" className="mt-6 space-y-6">
            <AdvancedWatermarkProtection 
              files={rawFiles}
              onWatermarkComplete={(results) => {
                setWatermarkResults(results);
                setCompletedTabs(prev => new Set(prev).add('watermark'));
                toast({
                  title: "Watermarking Complete",
                  description: `Processed ${results.filter(r => r.success).length} of ${results.length} files`,
                });
              }}
            />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Content Credentials (C2PA)
                </CardTitle>
                <CardDescription>
                  Add tamper-evident provenance data to prove authenticity and ownership
                </CardDescription>
              </CardHeader>
              <CardContent>
                <C2PAProtection />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analyze" className="mt-6">
            <VisualRecognition />
          </TabsContent>
        </Tabs>
      </div>
      <BugReportButton />
    </div>
  );
};

export default Upload;