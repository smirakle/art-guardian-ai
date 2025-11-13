import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProtectedDocumentUpload } from "@/hooks/useProtectedDocumentUpload";
import { Upload, FileText, Shield } from "lucide-react";
import { useState, useRef } from "react";
import { Progress } from "@/components/ui/progress";

export const DocumentUploadSection = () => {
  const { uploadProtectedDocument, uploading } = useProtectedDocumentUpload();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [protectionLevel, setProtectionLevel] = useState<"basic" | "standard" | "maximum">("standard");
  const [enableTracers, setEnableTracers] = useState(true);
  const [enableFingerprinting, setEnableFingerprinting] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleLoadSample = () => {
    const sampleText = `Sample Protected Document

This is a test document for demonstrating the AI protection and monitoring system.

Key Features:
- Invisible watermarking technology
- AI training prevention
- Plagiarism detection
- Unauthorized usage tracking
- Real-time monitoring alerts

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

This document contains unique patterns that can be tracked across the internet to detect unauthorized usage and AI training attempts.`;

    const blob = new Blob([sampleText], { type: 'text/plain' });
    const file = new File([blob], 'sample-test-document.txt', { type: 'text/plain' });
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    await uploadProtectedDocument(selectedFile, {
      protectionLevel,
      enableTracers,
      enableFingerprinting,
    });

    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload & Protect Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Select Document</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              {selectedFile ? selectedFile.name : "Choose File"}
            </Button>
            <Button
              variant="secondary"
              onClick={handleLoadSample}
              size="sm"
            >
              Load Sample
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.md"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          {selectedFile && (
            <p className="text-xs text-muted-foreground">
              Size: {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Protection Level</Label>
          <Select
            value={protectionLevel}
            onValueChange={(value: any) => setProtectionLevel(value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic - Fingerprinting only</SelectItem>
              <SelectItem value="standard">Standard - Fingerprinting + Tracers</SelectItem>
              <SelectItem value="maximum">Maximum - All protection methods</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3 p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <p className="text-sm font-medium">Protection Features</p>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1 ml-6">
            <li>• AI fingerprinting for plagiarism detection</li>
            <li>• Invisible tracers for unauthorized usage tracking</li>
            <li>• Pattern injection for AI training prevention</li>
            <li>• Metadata embedding for ownership proof</li>
          </ul>
        </div>

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full"
        >
          {uploading ? "Protecting Document..." : "Upload & Protect"}
        </Button>

        {uploading && (
          <div className="space-y-2">
            <Progress value={66} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              Applying protection methods...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
