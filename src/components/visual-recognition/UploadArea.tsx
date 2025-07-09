import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader, ImageIcon } from "lucide-react";

interface UploadAreaProps {
  onFileUpload: (files: FileList | null) => void;
  isInitializing: boolean;
  isEmpty: boolean;
}

const UploadArea = ({ onFileUpload, isInitializing, isEmpty }: UploadAreaProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
                Upload images to start AI-powered copyright analysis and visual recognition
              </p>
            </div>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Your First Image
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
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
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Upload images for AI-powered copyright detection, similarity analysis, and content classification
            </p>
            {isInitializing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader className="w-4 h-4 animate-spin" />
                Initializing AI models...
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Images
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
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