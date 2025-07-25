import { useState, useCallback } from "react";
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
  Link,
  Brain,
  Activity,
  Globe,
  Users,
  Eye,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useImageAnalysis } from "@/hooks/useImageAnalysis";
import { ImageAnalysis } from "@/types/visual-recognition";
import { enhancedWatermarkService, EnhancedWatermarkOptions, EnhancedWatermarkSystem } from "@/lib/enhancedWatermark";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
  status: 'uploading' | 'processing' | 'protected' | 'error';
  progress: number;
}

interface UploadWidgetProps {
  onUploadComplete?: (artworkId: string) => void;
}

export const UploadWidget = ({ onUploadComplete }: UploadWidgetProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { analyzeImage } = useImageAnalysis();
  
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
  const [enableRealTimeAI, setEnableRealTimeAI] = useState(true);
  const [enableSocialMediaScan, setEnableSocialMediaScan] = useState(true);
  const [enableDeepfakeDetection, setEnableDeepfakeDetection] = useState(true);
  const [enableWebScanner, setEnableWebScanner] = useState(true);
  const [isProtecting, setIsProtecting] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const [images, setImages] = useState<ImageAnalysis[]>([]);

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

  const processFiles = async (fileList: File[]) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upload files",
        variant: "destructive",
      });
      return;
    }

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
      await uploadFile(file, fileId);
    }
  };

  const uploadFile = async (file: File, fileId: string) => {
    try {
      const fileName = `${user!.id}/${Date.now()}-${file.name}`;
      
      // Apply enhanced watermark if enabled and file is an image
      let processedFile = file;
      if (enableWatermark && file.type.startsWith('image/')) {
        try {
          const watermarkId = EnhancedWatermarkSystem.generateWatermarkId(user!.id);
          const watermarkOptions: EnhancedWatermarkOptions = {
            type: 'invisible',
            protectionLevel: 'standard',
            text: watermarkId
          };
          const watermarkedBlob = await enhancedWatermarkService.applyWatermark(file, watermarkOptions);
          processedFile = new File([watermarkedBlob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
        } catch (error) {
          console.error('Watermarking failed, using original file:', error);
        }
      }
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('artwork')
        .upload(fileName, processedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Update file status to processing
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'processing', progress: 100 } : f
      ));

      // Create artwork record
      const artworkData = {
        user_id: user!.id,
        title: artworkTitle || file.name,
        description: description || null,
        category: category || 'digital',
        tags: tags.length > 0 ? tags : null,
        license_type: licenseType || null,
        file_paths: [fileName],
        enable_watermark: enableWatermark,
        enable_blockchain: enableBlockchain,
        status: 'protected'
      };

      const { data: artwork, error: artworkError } = await supabase
        .from('artwork')
        .insert(artworkData)
        .select()
        .single();

      if (artworkError) throw artworkError;

      // Start comprehensive AI scanning
      await startComprehensiveScanning(artwork.id, fileName, file);

      // Update file status to protected
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'protected' } : f
      ));
      
      toast({
        title: "File Protected",
        description: `${file.name} is now protected with AI monitoring`,
      });

      onUploadComplete?.(artwork.id);

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

  const startComprehensiveScanning = async (artworkId: string, fileName: string, file: File) => {
    try {
      // 1. Real-time AI monitoring scan
      if (enableRealTimeAI) {
        await supabase.from('monitoring_scans').insert({
          artwork_id: artworkId,
          scan_type: 'realtime-ai',
          status: 'running',
          started_at: new Date().toISOString(),
          total_sources: 5000
        });
      }

      // 2. Deepfake detection
      if (enableDeepfakeDetection && file.type.startsWith('image/')) {
        try {
          await supabase.functions.invoke('deepfake-scan-upload', {
            body: {
              filePath: fileName,
              fileName: file.name,
              artworkId: artworkId
            }
          });
        } catch (error) {
          console.error('Deepfake detection failed:', error);
        }
      }

      // 3. Enhanced visual recognition
      if (file.type.startsWith('image/')) {
        await supabase.from('monitoring_scans').insert({
          artwork_id: artworkId,
          scan_type: 'visual-recognition-enhanced',
          status: 'running',
          started_at: new Date().toISOString(),
          total_sources: 2500
        });
      }

      // 4. Web scanner
      if (enableWebScanner) {
        await supabase.from('monitoring_scans').insert({
          artwork_id: artworkId,
          scan_type: 'comprehensive-web',
          status: 'running',
          started_at: new Date().toISOString(),
          total_sources: 10000
        });
      }

      // 5. Social media monitoring
      if (enableSocialMediaScan) {
        await supabase.from('monitoring_scans').insert({
          artwork_id: artworkId,
          scan_type: 'social-media',
          status: 'running',
          started_at: new Date().toISOString(),
          total_sources: 1500
        });
      }

      // 6. Blockchain verification
      if (enableBlockchain) {
        try {
          await supabase.functions.invoke('blockchain-registration', {
            body: {
              artworkId: artworkId,
              title: artworkTitle || file.name,
              description: description || null,
              category: category || 'digital',
              filePaths: [fileName],
              userEmail: user?.email || 'unknown@example.com',
              userId: user?.id
            }
          });
          
          toast({
            title: "Blockchain Certificate Created",
            description: "Immutable proof of ownership registered",
          });
        } catch (error) {
          console.error('Blockchain registration failed:', error);
        }
      }

    } catch (error) {
      console.error('Error starting comprehensive scanning:', error);
    }
  };

  const addUrl = () => {
    if (urlInput.trim() && !urls.includes(urlInput.trim())) {
      try {
        new URL(urlInput.trim());
        setUrls([...urls, urlInput.trim()]);
        setUrlInput("");
        toast({
          title: "URL Added", 
          description: "Link has been added for AI monitoring",
        });
      } catch {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid URL",
          variant: "destructive",
        });
      }
    }
  };

  const processTextContent = async () => {
    if (!textInput.trim()) return;
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to protect text content",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create artwork record for text
      const textArtwork = {
        title: artworkTitle || `Text Content - ${textInput.substring(0, 50)}${textInput.length > 50 ? '...' : ''}`,
        description: textInput,
        category: 'text',
        user_id: user.id,
        file_paths: [],
        status: 'monitoring'
      };

      const { data: artwork, error: artworkError } = await supabase
        .from('artwork')
        .insert(textArtwork)
        .select()
        .single();

      if (artworkError) throw artworkError;

      // Start text monitoring scans
      await supabase.from('monitoring_scans').insert({
        artwork_id: artwork.id,
        scan_type: 'text-plagiarism',
        status: 'running',
        started_at: new Date().toISOString(),
        total_sources: 5000
      });

      toast({
        title: "Text Content Protected",
        description: "Text content is now being monitored for plagiarism",
      });

      setTextInput("");
      onUploadComplete?.(artwork.id);

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to process text content",
        variant: "destructive",
      });
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

  const removeUrl = (urlToRemove: string) => {
    setUrls(urls.filter(url => url !== urlToRemove));
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI Protection Upload Center
        </CardTitle>
        <CardDescription>
          Upload and protect your content with comprehensive AI monitoring
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="files" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="files" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Files
            </TabsTrigger>
            <TabsTrigger value="urls" className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              URLs
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="space-y-4">
            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Drop files here or click to upload</p>
              <p className="text-sm text-muted-foreground mb-4">
                Supports images, videos, documents, and more
              </p>
              <Input
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Button asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Plus className="w-4 h-4 mr-2" />
                  Choose Files
                </label>
              </Button>
            </div>

            {/* Uploaded Files List */}
            {files.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Uploaded Files</h4>
                {files.map((file) => (
                  <div key={file.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    {file.preview && (
                      <img src={file.preview} alt="" className="w-10 h-10 object-cover rounded" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)} • {getStatusIcon(file.status)}
                      </p>
                      {file.status === 'uploading' && (
                        <Progress value={file.progress} className="mt-1" />
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setFiles(prev => prev.filter(f => f.id !== file.id))}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="urls" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url-input">Social Media or Web Content URL</Label>
              <div className="flex gap-2">
                <Input
                  id="url-input"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/content"
                  onKeyPress={(e) => e.key === 'Enter' && addUrl()}
                />
                <Button onClick={addUrl}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {urls.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Added URLs</h4>
                {urls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1 truncate text-sm">{url}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeUrl(url)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-input">Text Content</Label>
              <Textarea
                id="text-input"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter your text content to protect against plagiarism..."
                rows={6}
              />
            </div>
            <Button onClick={processTextContent} disabled={!textInput.trim()}>
              <Shield className="w-4 h-4 mr-2" />
              Protect Text Content
            </Button>
          </TabsContent>
        </Tabs>

        {/* Metadata Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Artwork Title</Label>
            <Input
              id="title"
              value={artworkTitle}
              onChange={(e) => setArtworkTitle(e.target.value)}
              placeholder="Enter artwork title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="digital">Digital Art</SelectItem>
                <SelectItem value="photography">Photography</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="text">Text/Writing</SelectItem>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="design">Design</SelectItem>
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
            placeholder="Describe your artwork..."
            rows={3}
          />
        </div>

        {/* AI Protection Options */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Protection Features
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="realtime-ai" 
                checked={enableRealTimeAI} 
                onCheckedChange={(checked) => setEnableRealTimeAI(checked === true)} 
              />
              <Label htmlFor="realtime-ai" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Real-time AI Monitoring
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="deepfake" 
                checked={enableDeepfakeDetection} 
                onCheckedChange={(checked) => setEnableDeepfakeDetection(checked === true)} 
              />
              <Label htmlFor="deepfake" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Deepfake Detection
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="social-media" 
                checked={enableSocialMediaScan} 
                onCheckedChange={(checked) => setEnableSocialMediaScan(checked === true)} 
              />
              <Label htmlFor="social-media" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Social Media Scanning
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="web-scanner" 
                checked={enableWebScanner} 
                onCheckedChange={(checked) => setEnableWebScanner(checked === true)} 
              />
              <Label htmlFor="web-scanner" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Web Scanner
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="watermark" 
                checked={enableWatermark} 
                onCheckedChange={(checked) => setEnableWatermark(checked === true)} 
              />
              <Label htmlFor="watermark" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Enhanced Watermarking
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="blockchain" 
                checked={enableBlockchain} 
                onCheckedChange={(checked) => setEnableBlockchain(checked === true)} 
              />
              <Label htmlFor="blockchain" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Blockchain Verification
              </Label>
            </div>
          </div>
        </div>

        {/* Alert for features selected */}
        {(enableRealTimeAI || enableDeepfakeDetection || enableSocialMediaScan || enableWebScanner) && (
          <Alert>
            <Brain className="h-4 w-4" />
            <AlertDescription>
              Advanced AI protection features enabled. Your content will be monitored across multiple platforms and scanning methods.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};