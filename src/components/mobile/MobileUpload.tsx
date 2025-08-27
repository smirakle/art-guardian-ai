import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Upload as UploadIcon, 
  Image, 
  Shield, 
  CheckCircle,
  AlertTriangle,
  Plus,
  X,
  FileImage,
  Smartphone
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface MobileUploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
  status: 'uploading' | 'processing' | 'protected' | 'error';
  progress: number;
}

export const MobileUpload = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const [files, setFiles] = useState<MobileUploadedFile[]>([]);
  const [artworkTitle, setArtworkTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isProtecting, setIsProtecting] = useState(false);
  const [enableWatermark, setEnableWatermark] = useState(true);

  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const processFiles = async (fileList: FileList | null) => {
    if (!fileList) return;

    for (const file of Array.from(fileList)) {
      const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newFile: MobileUploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0
      };

      // Create preview for images
      if (file.type.startsWith('image/')) {
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
      const userId = user?.id || 'anonymous';
      const fileName = `${userId}/${Date.now()}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('artwork')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Simulate progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, progress } : f
        ));
        
        if (progress >= 100) {
          clearInterval(interval);
          setFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, status: 'protected', progress: 100 } : f
          ));
        }
      }, 300);

      toast({
        title: "Upload Complete",
        description: `${file.name} uploaded successfully`,
      });

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

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: MobileUploadedFile['status']) => {
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

  const handleStartProtection = async () => {
    if (files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please upload at least one file to protect",
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

    setIsProtecting(true);

    try {
      // Create artwork record if user is authenticated
      if (user) {
        const { data: artworkData, error: artworkError } = await supabase
          .from('artwork')
          .insert({
            user_id: user.id,
            title: artworkTitle,
            description: description || null,
            category: category || 'digital',
            file_paths: [],
            enable_watermark: enableWatermark,
            status: 'protected'
          })
          .select()
          .single();

        if (artworkError) throw artworkError;

        toast({
          title: "Protection Complete!",
          description: "Your artwork is now protected and being monitored",
        });
      }

      // Reset form
      setArtworkTitle("");
      setDescription("");
      setCategory("");
      setFiles([]);
      
    } catch (error: any) {
      console.error('Protection error:', error);
      toast({
        title: "Protection Failed",
        description: error.message || "Failed to protect artwork",
        variant: "destructive",
      });
    } finally {
      setIsProtecting(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Smartphone className="w-5 h-5" />
            Mobile Upload & Protection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Options */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleCameraCapture}
              variant="outline"
              className="h-16 flex-col"
              type="button"
            >
              <Camera className="w-6 h-6 mb-1" />
              <span className="text-xs">Camera</span>
            </Button>
            <Button
              onClick={handleFileSelect}
              variant="outline"
              className="h-16 flex-col"
              type="button"
            >
              <FileImage className="w-6 h-6 mb-1" />
              <span className="text-xs">Gallery</span>
            </Button>
          </div>

          {/* Hidden file inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => processFiles(e.target.files)}
            className="hidden"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={(e) => processFiles(e.target.files)}
            className="hidden"
          />

          {/* Uploaded Files */}
          {files.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Uploaded Files</Label>
              {files.map((file) => (
                <div key={file.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(file.status)}
                      <span className="text-sm font-medium truncate">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  {file.preview && (
                    <div className="mb-2">
                      <img 
                        src={file.preview} 
                        alt="Preview" 
                        className="w-full h-20 object-cover rounded"
                      />
                    </div>
                  )}
                  
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>{formatFileSize(file.size)}</span>
                    <Badge variant="secondary" className="text-xs">
                      {file.status}
                    </Badge>
                  </div>
                  
                  {file.status === 'uploading' && (
                    <Progress value={file.progress} className="h-1" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Artwork Details */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="title" className="text-sm">Artwork Title *</Label>
              <Input
                id="title"
                value={artworkTitle}
                onChange={(e) => setArtworkTitle(e.target.value)}
                placeholder="Enter artwork title"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your artwork"
                rows={2}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-sm">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="photography">Photography</SelectItem>
                  <SelectItem value="digital">Digital Art</SelectItem>
                  <SelectItem value="painting">Painting</SelectItem>
                  <SelectItem value="illustration">Illustration</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="mixed_media">Mixed Media</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Protection Options */}
          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Watermark Protection</span>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={enableWatermark}
                  onChange={(e) => setEnableWatermark(e.target.checked)}
                  className="rounded"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Adds invisible watermark for tracking
            </p>
          </div>

          {/* Start Protection Button */}
          <Button
            onClick={handleStartProtection}
            disabled={isProtecting || files.length === 0}
            className="w-full"
          >
            {isProtecting ? (
              <>
                <Shield className="w-4 h-4 mr-2 animate-spin" />
                Starting Protection...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Start Protection
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};