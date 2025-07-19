import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EnhancedWatermarkOptions, enhancedWatermarkService } from '@/lib/enhancedWatermark';
import { Download, RefreshCw, Eye, EyeOff, Info } from 'lucide-react';
import { toast } from 'sonner';

interface WatermarkPreviewProps {
  originalFile: File | null;
  watermarkOptions: EnhancedWatermarkOptions;
  onWatermarkedFileReady?: (file: Blob) => void;
}

export const WatermarkPreview: React.FC<WatermarkPreviewProps> = ({
  originalFile,
  watermarkOptions,
  onWatermarkedFileReady
}) => {
  const [originalPreview, setOriginalPreview] = useState<string>('');
  const [watermarkedPreview, setWatermarkedPreview] = useState<string>('');
  const [watermarkedBlob, setWatermarkedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showComparison, setShowComparison] = useState(true);
  const [processingProgress, setProcessingProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (originalFile) {
      const url = URL.createObjectURL(originalFile);
      setOriginalPreview(url);
      generateWatermarkedPreview();
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [originalFile, watermarkOptions]);

  const generateWatermarkedPreview = async () => {
    if (!originalFile) return;

    setIsProcessing(true);
    setProcessingProgress(0);

    // Simulate progress
    intervalRef.current = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 90) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const watermarkedBlob = await enhancedWatermarkService.applyWatermark(originalFile, watermarkOptions);
      const url = URL.createObjectURL(watermarkedBlob);
      
      setWatermarkedPreview(url);
      setWatermarkedBlob(watermarkedBlob);
      setProcessingProgress(100);
      
      if (onWatermarkedFileReady) {
        onWatermarkedFileReady(watermarkedBlob);
      }

      toast.success('Watermark applied successfully!');
    } catch (error) {
      console.error('Failed to apply watermark:', error);
      toast.error('Failed to apply watermark');
    } finally {
      setIsProcessing(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const downloadWatermarkedImage = () => {
    if (watermarkedBlob && originalFile) {
      const url = URL.createObjectURL(watermarkedBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `watermarked_${originalFile.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Watermarked image downloaded!');
    }
  };

  const refreshPreview = () => {
    generateWatermarkedPreview();
  };

  const getWatermarkTypeInfo = () => {
    const type = watermarkOptions.type || 'invisible';
    switch (type) {
      case 'visible':
        return {
          icon: <Eye className="w-4 h-4" />,
          text: 'Visible watermark overlay',
          color: 'bg-blue-100 text-blue-800'
        };
      case 'invisible':
        return {
          icon: <EyeOff className="w-4 h-4" />,
          text: 'Invisible steganographic watermark',
          color: 'bg-green-100 text-green-800'
        };
      case 'hybrid':
        return {
          icon: <RefreshCw className="w-4 h-4" />,
          text: 'Hybrid visible + invisible watermark',
          color: 'bg-purple-100 text-purple-800'
        };
      default:
        return {
          icon: <Info className="w-4 h-4" />,
          text: 'No watermark applied',
          color: 'bg-gray-100 text-gray-800'
        };
    }
  };

  if (!originalFile) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Upload an image to see the watermark preview</p>
        </CardContent>
      </Card>
    );
  }

  const typeInfo = getWatermarkTypeInfo();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Watermark Preview</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={`${typeInfo.color} flex items-center gap-1`}>
              {typeInfo.icon}
              {typeInfo.text}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowComparison(!showComparison)}
            >
              {showComparison ? 'Hide' : 'Show'} Comparison
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Applying watermark...</span>
              <span>{processingProgress}%</span>
            </div>
            <Progress value={processingProgress} className="w-full" />
          </div>
        )}

        <div className={`grid gap-4 ${showComparison ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
          {showComparison && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Original</h4>
              <div className="relative rounded-lg overflow-hidden border bg-muted">
                {originalPreview && (
                  <img
                    src={originalPreview}
                    alt="Original"
                    className="w-full h-48 object-contain"
                  />
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">
                {showComparison ? 'Watermarked' : 'Preview'}
              </h4>
              <Button size="sm" variant="ghost" onClick={refreshPreview} disabled={isProcessing}>
                <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <div className="relative rounded-lg overflow-hidden border bg-muted">
              {watermarkedPreview ? (
                <img
                  src={watermarkedPreview}
                  alt="Watermarked"
                  className="w-full h-48 object-contain"
                />
              ) : (
                <div className="w-full h-48 flex items-center justify-center">
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Processing watermark...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {watermarkedBlob && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <Badge variant="outline">
                Original: {(originalFile.size / 1024).toFixed(1)} KB
              </Badge>
              <Badge variant="outline">
                Watermarked: {(watermarkedBlob.size / 1024).toFixed(1)} KB
              </Badge>
              <Badge variant="outline">
                Overhead: {(((watermarkedBlob.size - originalFile.size) / originalFile.size) * 100).toFixed(1)}%
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button onClick={downloadWatermarkedImage} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download Watermarked Image
              </Button>
            </div>

            {watermarkOptions.type === 'invisible' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <Info className="w-4 h-4 inline mr-1" />
                  This invisible watermark cannot be seen but provides strong copyright protection.
                  Use our detection tools to verify the watermark presence.
                </p>
              </div>
            )}

            {watermarkOptions.type === 'hybrid' && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-800">
                  <Info className="w-4 h-4 inline mr-1" />
                  This hybrid watermark combines visible deterrent with invisible protection.
                  Perfect for maximum security and deterrent effect.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};