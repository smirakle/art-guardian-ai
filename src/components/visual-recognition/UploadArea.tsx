import { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Upload, Loader, ImageIcon, Link, FileText, Shield } from "lucide-react";
import { AITrainingProtection } from '@/components/AITrainingProtection';

interface UploadAreaProps {
  onFileUpload: (files: FileList | null) => void;
  onUrlUpload: (url: string) => void;
  onTextUpload: (text: string) => void;
  isInitializing: boolean;
  isEmpty: boolean;
}

interface UploadedFile {
  file: File;
  needsProtection: boolean;
  fileType: 'image' | 'video' | 'audio' | 'document';
}

const UploadArea = ({ onFileUpload, onUrlUpload, onTextUpload, isInitializing, isEmpty }: UploadAreaProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [pendingFiles, setPendingFiles] = useState<UploadedFile[]>([]);
  const [showProtection, setShowProtection] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  const getFileType = (file: File): 'image' | 'video' | 'audio' | 'document' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onUrlUpload(urlInput.trim());
      setUrlInput("");
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      onTextUpload(textInput.trim());
      setTextInput("");
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    // Check if AI protection is enabled
    const aiProtectionSettings = localStorage.getItem('aiProtectionSettings');
    const settings = aiProtectionSettings ? JSON.parse(aiProtectionSettings) : { globalProtection: true, autoApply: true };
    
    if (settings.globalProtection && settings.autoApply) {
      // Prepare files for protection
      const uploadedFiles: UploadedFile[] = Array.from(files).map(file => ({
        file,
        needsProtection: true,
        fileType: getFileType(file)
      }));
      
      setPendingFiles(uploadedFiles);
      setCurrentFileIndex(0);
      setShowProtection(true);
      return;
    }
    
    // Process files without protection
    onFileUpload(files);
  };

  const handleProtectionApplied = (protectionLevel: string, methods: string[]) => {
    // Move to next file or finish
    if (currentFileIndex < pendingFiles.length - 1) {
      setCurrentFileIndex(prev => prev + 1);
    } else {
      // All files processed, now upload them
      setShowProtection(false);
      const fileList = new DataTransfer();
      pendingFiles.forEach(f => fileList.items.add(f.file));
      onFileUpload(fileList.files);
      setPendingFiles([]);
      setCurrentFileIndex(0);
    }
  };

  const skipProtection = () => {
    setShowProtection(false);
    const fileList = new DataTransfer();
    pendingFiles.forEach(f => fileList.items.add(f.file));
    onFileUpload(fileList.files);
    setPendingFiles([]);
    setCurrentFileIndex(0);
  };

  if (showProtection && pendingFiles.length > 0) {
    const currentFile = pendingFiles[currentFileIndex];
    return (
      <div className="w-full max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            AI Training Protection ({currentFileIndex + 1} of {pendingFiles.length})
          </h3>
          <Button variant="outline" onClick={skipProtection}>
            Skip Protection
          </Button>
        </div>
        <AITrainingProtection
          fileType={currentFile.fileType}
          fileName={currentFile.file.name}
          onProtectionApply={handleProtectionApplied}
        />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <ImageIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">No Content Uploaded</h3>
            <p className="text-sm text-muted-foreground">
              Upload files, add links, or paste text content to start AI-powered copyright analysis and monitoring
            </p>
            </div>
            <div className="space-y-3 w-full">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Paste article URL, blog post, or any web content link..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                  className="flex-1"
                />
                <Button onClick={handleUrlSubmit} variant="outline" className="w-full sm:w-auto whitespace-nowrap">
                  <Link className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Add Link
                </Button>
              </div>
              <div className="space-y-2">
                <Textarea
                  placeholder="Paste your text content here for copyright analysis and monitoring..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="min-h-[80px] sm:min-h-[100px] w-full"
                />
                <Button onClick={handleTextSubmit} variant="outline" className="w-full">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Analyze Text
                </Button>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 flex-1"
                >
                  <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Upload Files
                </Button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*,application/pdf"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary" />
          Content Analysis & Copyright Protection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:justify-between">
          <div className="flex-1">
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
              Upload files, add links, or paste text for AI-powered copyright detection, similarity analysis, and content classification
            </p>
            {isInitializing && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Loader className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                Initializing AI models...
              </div>
            )}
          </div>
          <div className="w-full lg:w-auto lg:min-w-[300px] space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Paste article URL, blog post, or any web content link..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                className="flex-1"
              />
              <Button onClick={handleUrlSubmit} variant="outline" className="w-full sm:w-auto whitespace-nowrap">
                <Link className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Add Link
              </Button>
            </div>
            <div className="space-y-2">
              <Textarea
                placeholder="Paste your text content here for copyright analysis and monitoring..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="min-h-[60px] sm:min-h-[80px] w-full"
              />
              <Button onClick={handleTextSubmit} variant="outline" className="w-full">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Analyze Text
              </Button>
            </div>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 w-full"
            >
              <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Upload Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*,application/pdf"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadArea;