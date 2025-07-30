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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload as UploadIcon, 
  Image, 
  Shield, 
  CheckCircle,
  AlertTriangle,
  Plus,
  X,
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

interface PortfolioUploadWidgetProps {
  portfolioId: string;
  portfolioName: string;
  onUploadComplete?: (artworkId: string) => void;
  onClose?: () => void;
}

export const PortfolioUploadWidget = ({ 
  portfolioId, 
  portfolioName, 
  onUploadComplete, 
  onClose 
}: PortfolioUploadWidgetProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
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
        status: 'completed' // Mark as completed for immediate portfolio addition
      };

      const { data: artwork, error: artworkError } = await supabase
        .from('artwork')
        .insert(artworkData)
        .select()
        .single();

      if (artworkError) throw artworkError;

      // Add artwork to portfolio immediately
      const { error: portfolioError } = await supabase
        .from('portfolio_items')
        .insert({
          portfolio_id: portfolioId,
          artwork_id: artwork.id
        });

      if (portfolioError) throw portfolioError;

      // Start comprehensive AI scanning
      await startComprehensiveScanning(artwork.id, fileName, file);

      // Update file status to protected
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'protected' } : f
      ));
      
      toast({
        title: "File Added to Portfolio",
        description: `${file.name} has been uploaded and added to ${portfolioName}`,
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

      // 6. Advanced Blockchain Protection
      if (enableBlockchain) {
        try {
          await supabase.functions.invoke('advanced-blockchain-registration', {
            body: {
              artworkId: artworkId,
              network: 'polygon',
              userId: user!.id,
              smartContractSettings: {
                royaltyPercentage: 10,
                licenseTerms: 'standard',
                transferable: true,
                resellable: true
              },
              advancedFeatures: true,
              realTimeProtection: true
            }
          });
        } catch (error) {
          console.error('Blockchain registration failed:', error);
        }
      }

    } catch (error) {
      console.error('Error starting comprehensive scanning:', error);
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Upload to {portfolioName}
            </CardTitle>
            <CardDescription>
              Upload and protect files directly to this portfolio
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <UploadIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Drag & drop files here</h3>
              <p className="text-muted-foreground">or click to browse</p>
            </div>
            <input
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              className="hidden"
              id="file-upload"
              onChange={handleFileSelect}
            />
            <label htmlFor="file-upload">
              <Button asChild>
                <span>Choose Files</span>
              </Button>
            </label>
          </div>
        </div>

        {/* Metadata Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Artwork Title</Label>
            <Input
              id="title"
              value={artworkTitle}
              onChange={(e) => setArtworkTitle(e.target.value)}
              placeholder="Enter artwork title"
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="digital">Digital Art</SelectItem>
                <SelectItem value="photography">Photography</SelectItem>
                <SelectItem value="illustration">Illustration</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your artwork"
            rows={3}
          />
        </div>

        {/* Tags */}
        <div>
          <Label>Tags</Label>
          <div className="flex gap-2 mt-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add tags"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button onClick={addTag} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* AI Protection Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Shield className="w-5 h-5" />
            AI Protection Features
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Activity className="w-4 h-4" />
                Blockchain Registration
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="realtime-ai"
                checked={enableRealTimeAI}
                onCheckedChange={(checked) => setEnableRealTimeAI(checked === true)}
              />
              <Label htmlFor="realtime-ai" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
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
                id="social-media"
                checked={enableSocialMediaScan}
                onCheckedChange={(checked) => setEnableSocialMediaScan(checked === true)}
              />
              <Label htmlFor="social-media" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Social Media Scan
              </Label>
            </div>
          </div>
        </div>

        {/* Uploaded Files List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Uploaded Files</h3>
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(file.status)}
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Badge variant={file.status === 'protected' ? 'default' : 'secondary'}>
                  {file.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};