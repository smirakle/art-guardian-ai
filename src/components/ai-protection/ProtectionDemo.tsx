import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Shield, FileCheck } from "lucide-react";
import { AITrainingProtection } from '@/components/AITrainingProtection';
import { useToast } from "@/hooks/use-toast";

export const ProtectionDemo = () => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showProtection, setShowProtection] = useState(false);
  const [isProtected, setIsProtected] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowProtection(true);
      setIsProtected(false);
    }
  };

  const handleProtectionApplied = (protectionLevel: string, methods: string[]) => {
    setShowProtection(false);
    setIsProtected(true);
    toast({
      title: "Demo Protection Complete!",
      description: `File protected with ${protectionLevel} level using ${methods.length} methods`,
    });
  };

  const getFileType = (file: File): 'image' | 'video' | 'audio' | 'document' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const resetDemo = () => {
    setSelectedFile(null);
    setShowProtection(false);
    setIsProtected(false);
  };

  if (showProtection && selectedFile) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">AI Protection Demo</h3>
          <Button variant="outline" onClick={resetDemo}>
            Cancel Demo
          </Button>
        </div>
        <AITrainingProtection
          fileType={getFileType(selectedFile)}
          fileName={selectedFile.name}
          file={selectedFile}
          onProtectionApply={handleProtectionApplied}
        />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          AI Protection Demo
        </CardTitle>
        <CardDescription>
          Test the AI training protection system with a sample file
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!selectedFile && !isProtected && (
            <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <div className="space-y-2">
                <h4 className="font-medium">Upload a Test File</h4>
                <p className="text-sm text-muted-foreground">
                  Choose any image, video, audio, or document to test AI protection
                </p>
                <Button 
                  onClick={() => document.getElementById('demo-file-input')?.click()}
                  variant="outline"
                >
                  Select File
                </Button>
                <input
                  id="demo-file-input"
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                  className="hidden"
                />
              </div>
            </div>
          )}

          {isProtected && selectedFile && (
            <div className="text-center py-8">
              <FileCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h4 className="font-medium text-green-700">Protection Applied Successfully!</h4>
              <p className="text-sm text-muted-foreground mt-2">
                "{selectedFile.name}" is now protected from AI training
              </p>
              <Button 
                onClick={resetDemo}
                variant="outline"
                className="mt-4"
              >
                Try Another File
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};