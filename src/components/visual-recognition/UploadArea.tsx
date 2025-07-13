import { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Upload, Loader, ImageIcon, Link } from "lucide-react";

interface UploadAreaProps {
  onFileUpload: (files: FileList | null) => void;
  onUrlUpload: (url: string) => void;
  isInitializing: boolean;
  isEmpty: boolean;
}

const UploadArea = ({ onFileUpload, onUrlUpload, isInitializing, isEmpty }: UploadAreaProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onUrlUpload(urlInput.trim());
      setUrlInput("");
    }
  };

  if (isEmpty) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <ImageIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">No Images Uploaded</h3>
            <p className="text-sm text-muted-foreground">
              Upload images, videos, or audio files to start AI-powered copyright analysis and visual recognition
            </p>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Paste YouTube, TikTok, Instagram, Facebook, or X video link..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                />
                <Button onClick={handleUrlSubmit} variant="outline">
                  <Link className="w-4 h-4 mr-2" />
                  Add Link
                </Button>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*"
              onChange={(e) => onFileUpload(e.target.files)}
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
          Visual Recognition & Copyright Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-2">
              Upload images, videos, or audio files for AI-powered copyright detection, similarity analysis, and content classification
            </p>
            {isInitializing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader className="w-4 h-4 animate-spin" />
                Initializing AI models...
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Paste video link from YouTube, TikTok, Instagram, Facebook, or X..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                className="min-w-[300px]"
              />
              <Button onClick={handleUrlSubmit} variant="outline">
                <Link className="w-4 h-4 mr-2" />
                Add Link
              </Button>
            </div>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*"
              onChange={(e) => onFileUpload(e.target.files)}
              className="hidden"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadArea;