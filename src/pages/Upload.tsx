import { useState } from "react";
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
  Link
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

import { supabase } from "@/integrations/supabase/client";
import VisualRecognition from "@/components/VisualRecognition";

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
  
  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!user) {
      window.location.href = '/auth';
    }
  }, [user]);
  
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
    const supportedDomains = [
      'youtube.com', 'youtu.be', 'm.youtube.com',
      'tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com',
      'instagram.com', 'instagr.am',
      'facebook.com', 'fb.watch', 'm.facebook.com',
      'twitter.com', 'x.com', 't.co'
    ];
    
    try {
      const urlObj = new URL(url);
      return supportedDomains.some(domain => urlObj.hostname.includes(domain));
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
          description: "Video link has been added for protection",
        });
      } else {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid YouTube, TikTok, Instagram, Facebook, or X video link",
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
      if (!user) {
        throw new Error('Authentication required to upload files');
      }
      
      // Create file path
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      
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
    if (fileToRemove && fileToRemove.status === 'protected' && user) {
      try {
        const fileName = `${user.id}/${Date.now()}-${fileToRemove.name}`;
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
    // Check authentication first
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to protect your artwork",
        variant: "destructive",
      });
      return;
    }

    // Validation
    if (files.length === 0 && urls.length === 0) {
      toast({
        title: "No Content Selected",
        description: "Please upload at least one file or add a video link to protect",
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
      const filePaths = files.map(file => `${user.id}/${Date.now()}-${file.name}`);
      const allPaths = [...filePaths, ...urls];

      // Create artwork record in database
      const { data: artwork, error: artworkError } = await supabase
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

      // Start monitoring scan for the artwork
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

      // Update to protected status
      const finalFiles = files.map(file => ({ 
        ...file, 
        status: 'protected' as const,
        progress: 100 
      }));
      setFiles(finalFiles);

      // Handle blockchain registration if enabled
      if (enableBlockchain) {
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
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Upload & Analyze Your Artwork
          </h1>
          <p className="text-muted-foreground text-lg">
            Secure your creative work with AI-powered protection and visual recognition
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <UploadIcon className="w-4 h-4" />
              Upload & Protect
            </TabsTrigger>
            <TabsTrigger value="analyze" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Visual Recognition
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">

        {/* Upload Area */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadIcon className="w-5 h-5 text-primary" />
              Upload Files
            </CardTitle>
            <CardDescription>
              Drag and drop your artwork or click to browse files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Drop your files here</h3>
              <p className="text-muted-foreground mb-4">
                Support for files up to 50MB each and video links from YouTube, TikTok, Instagram, Facebook, and X
              </p>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Paste YouTube, TikTok, Instagram, Facebook, or X video link..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addUrl()}
                />
                <Button onClick={addUrl} variant="outline">
                  <Link className="w-4 h-4 mr-2" />
                  Add Link
                </Button>
              </div>
              <input
                type="file"
                multiple
                accept="image/*,video/*,audio/*,.pdf"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <input
                type="file"
                multiple
                {...({ webkitdirectory: "true" } as any)}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="folder-upload"
              />
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="cursor-pointer"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Choose Files
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById('folder-upload')?.click()}
                  className="cursor-pointer"
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Upload Folder
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* URLs List */}
        {urls.length > 0 && (
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Added Video Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {urls.map((url, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Link className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium truncate max-w-[400px]">{url}</p>
                      <Badge variant="secondary" className="text-xs">Video Link</Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeUrl(url)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* File List */}
        {files.length > 0 && (
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Uploaded Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {files.map((file) => (
                <div key={file.id} className="flex items-center gap-4 p-4 border border-border/30 rounded-lg">
                  {file.preview ? (
                    file.type.startsWith('video/') ? (
                      <video src={file.preview} className="w-12 h-12 object-cover rounded" muted />
                    ) : (
                      <img src={file.preview} alt={file.name} className="w-12 h-12 object-cover rounded" />
                    )
                  ) : (
                    <FileText className="w-12 h-12 text-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{file.name}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)} • {file.type}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusIcon(file.status)}
                      <span className="text-sm">{getStatusText(file.status)}</span>
                    </div>
                    {file.status !== 'protected' && (
                      <Progress value={file.progress} className="mt-2" />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Artwork Details */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Artwork Details</CardTitle>
            <CardDescription>
              Add metadata to help our AI better protect your work
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Artwork Title</Label>
                <Input
                  id="title"
                  value={artworkTitle}
                  onChange={(e) => setArtworkTitle(e.target.value)}
                  placeholder="My Amazing Artwork"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="digital-art">Digital Art</SelectItem>
                    <SelectItem value="photography">Photography</SelectItem>
                    <SelectItem value="illustration">Illustration</SelectItem>
                    <SelectItem value="graphic-design">Graphic Design</SelectItem>
                    <SelectItem value="painting">Painting</SelectItem>
                    <SelectItem value="video">Video Content</SelectItem>
                    <SelectItem value="audio">Audio Content</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your artwork, inspiration, techniques used..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tags..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button onClick={addTag} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="license">License Type</Label>
              <Select value={licenseType} onValueChange={setLicenseType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select license" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-rights-reserved">All Rights Reserved</SelectItem>
                  <SelectItem value="cc-by">Creative Commons Attribution</SelectItem>
                  <SelectItem value="cc-by-sa">Creative Commons Attribution-ShareAlike</SelectItem>
                  <SelectItem value="cc-by-nc">Creative Commons Attribution-NonCommercial</SelectItem>
                  <SelectItem value="custom">Custom License</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Protection Options */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Protection Options
            </CardTitle>
            <CardDescription>
              Configure how your artwork will be protected
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="watermark"
                checked={enableWatermark}
                onCheckedChange={(checked) => setEnableWatermark(checked === true)}
              />
              <Label htmlFor="watermark" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Enable invisible watermarking for enhanced detection
              </Label>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="blockchain"
                  checked={enableBlockchain}
                  onCheckedChange={(checked) => setEnableBlockchain(checked === true)}
                />
                <Label htmlFor="blockchain" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Register on blockchain for immutable proof of ownership
                </Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Blockchain technology creates an unalterable, timestamped record of your artwork's ownership and creation date. This provides the strongest possible legal proof and prevents any disputes about authenticity or ownership rights.
              </p>
            </div>
          </CardContent>
        </Card>

            {/* Submit Button */}
            <div className="text-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground px-8 py-6 text-lg"
                disabled={files.length === 0 || isProtecting}
                onClick={handleStartProtection}
              >
                <Shield className="w-5 h-5 mr-2" />
                {isProtecting ? "Processing..." : "Start Protection"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="analyze">
            <VisualRecognition />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Upload;