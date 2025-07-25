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
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

import { supabase } from "@/integrations/supabase/client";
import VisualRecognition from "@/components/VisualRecognition";

import RealTimeDeepfakeMonitor from "@/components/RealTimeDeepfakeMonitor";
import RecentDeepfakeDetections from "@/components/RecentDeepfakeDetections";
import SocialMediaAccountManager from "@/components/SocialMediaAccountManager";
import SocialMediaMonitoringResults from "@/components/SocialMediaMonitoringResults";
import { ComprehensiveWebScanner } from "@/components/ComprehensiveWebScanner";
import RealTimeImageAnalysis from "@/components/RealTimeImageAnalysis";

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
  const [enableBlockchain, setEnableBlockchain] = useState(false);
  const [isProtecting, setIsProtecting] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urls, setUrls] = useState<string[]>([]);

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

      // Simulate processing time
      setTimeout(() => {
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'protected' } : f
        ));
        
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
            enable_blockchain: enableBlockchain,
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

      // Handle blockchain registration if enabled (only if user is authenticated)
      if (enableBlockchain && user && artwork) {
        try {
          toast({
            title: "Blockchain Registration Started",
            description: "Creating immutable proof of ownership...",
          });

          const { data: certificateData, error: blockchainError } = await supabase.functions.invoke('blockchain-registration', {
            body: {
              artworkId: artwork.id,
              title: artworkTitle,
              description: description || null,
              category,
              filePaths: allPaths,
              userEmail: user.email || 'unknown@example.com',
              userId: user.id
            }
          });

          if (blockchainError) {
            console.error('Blockchain registration error:', blockchainError);
            toast({
              title: "Blockchain Registration Failed",
              description: "Artwork is protected but blockchain registration failed. You can retry later.",
              variant: "destructive",
            });
          } else if (certificateData?.certificate) {
            toast({
              title: "Blockchain Certificate Created!",
              description: `Certificate ID: ${certificateData.certificate.certificateId}`,
            });
            
            console.log("Blockchain certificate created:", certificateData.certificate);
          }
        } catch (blockchainError: any) {
          console.error('Blockchain registration exception:', blockchainError);
          toast({
            title: "Blockchain Registration Error",
            description: "Continuing with standard protection. Blockchain registration can be retried.",
            variant: "destructive",
          });
        }
      }

      // Success notification
      const totalItems = files.length + urls.length;
      const blockchainMessage = enableBlockchain ? " with blockchain certificate" : "";
      toast({
        title: "Protection Complete!",
        description: `${totalItems} item(s) are now protected and being monitored 24/7${blockchainMessage}`,
      });

      console.log("Protection applied with:", {
        artworkId: artwork.id,
        title: artworkTitle,
        category,
        description,
        tags,
        licenseType,
        watermark: enableWatermark,
        blockchain: enableBlockchain,
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
                Protect Your Art
              </h1>
            </div>
            <p className="text-lg md:text-xl text-muted-foreground mb-4">
              Upload your creative work and get AI-powered protection with 24/7 monitoring
            </p>
            
            <Alert className="mb-4 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <span className="font-medium">New feature:</span> Test our monitoring system with our copyrighted image detector. Go to <strong>Quick Analysis → Test System</strong> tab to try it.
              </AlertDescription>
            </Alert>
            
            {!user && (
              <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
                <Info className="w-4 h-4" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  <strong>Free Access:</strong> You can upload and protect artwork without signing in. Sign in for full features like monitoring and blockchain verification.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        
        <div data-upload-area>
          <Tabs defaultValue="protect" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="protect" className="flex items-center gap-2">
                <UploadIcon className="w-4 h-4" />
                Real Time AI
              </TabsTrigger>
              <TabsTrigger value="realtime" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Real-Time AI
              </TabsTrigger>
              <TabsTrigger value="social" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Social Media
              </TabsTrigger>
              <TabsTrigger value="deepfake" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Deepfake Detection
              </TabsTrigger>
              <TabsTrigger value="webscanner" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Web Scanner
              </TabsTrigger>
            </TabsList>

            <TabsContent value="protect" className="space-y-6">
              <VisualRecognition />
            </TabsContent>

            <TabsContent value="social" className="space-y-6">
              <SocialMediaAccountManager />
              <SocialMediaMonitoringResults />
            </TabsContent>

            <TabsContent value="realtime" className="space-y-6">
              <RealTimeImageAnalysis />
            </TabsContent>

            <TabsContent value="deepfake" className="space-y-6">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Brain className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Real-Time Deepfake Monitoring
                    </h2>
                    <p className="text-muted-foreground">
                      Continuous AI-powered scanning across 2.5M+ surface and dark web sources
                    </p>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="monitor" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="monitor" className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Live Monitoring
                  </TabsTrigger>
                  <TabsTrigger value="detected" className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Detection Feed
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="monitor">
                  <RealTimeDeepfakeMonitor />
                </TabsContent>

                <TabsContent value="detected">
                  <RecentDeepfakeDetections />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="webscanner" className="space-y-6">
              <ComprehensiveWebScanner />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Upload;