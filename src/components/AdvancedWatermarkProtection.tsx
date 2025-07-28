import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Zap, 
  FileImage, 
  Video, 
  AudioLines, 
  FileText, 
  File,
  Download,
  CheckCircle,
  AlertTriangle,
  Settings,
  Crown,
  Lock,
  Upload,
  FolderOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { advancedWatermarkService, AdvancedWatermarkOptions, WatermarkResult } from '@/lib/advancedWatermark';

interface AdvancedWatermarkProtectionProps {
  files?: File[];
  onWatermarkComplete?: (results: WatermarkResult[]) => void;
  className?: string;
}

export const AdvancedWatermarkProtection: React.FC<AdvancedWatermarkProtectionProps> = ({
  files: propFiles = [],
  onWatermarkComplete,
  className = ''
}) => {
  const { toast } = useToast();
  const { hasFeature, subscription } = useSubscription();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<WatermarkResult[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  // Use either prop files or uploaded files
  const files = propFiles.length > 0 ? propFiles : uploadedFiles;
  
  // Watermark options
  const [options, setOptions] = useState<AdvancedWatermarkOptions>({
    text: 'TSMO Protected',
    type: 'hybrid',
    protectionLevel: 'standard',
    opacity: 0.3,
    size: 16,
    color: '#ffffff',
    position: 'bottom-right',
    rotation: 0,
    encryption: false,
    digitalSignature: false,
    timestamping: true,
    blockchainVerification: false,
    videoOptions: {
      frameInterval: 30,
      quality: 'medium',
      preserveAudio: true
    },
    audioOptions: {
      frequency: 'inaudible',
      embedMethod: 'lsb'
    },
    textOptions: {
      embedMethod: 'metadata',
      preserveFormatting: true
    },
    documentOptions: {
      embedLocation: 'metadata',
      preserveLayout: true
    }
  });

  const updateOption = <K extends keyof AdvancedWatermarkOptions>(
    key: K, 
    value: AdvancedWatermarkOptions[K]
  ) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'image': return <FileImage className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <AudioLines className="h-4 w-4" />;
      case 'text': return <FileText className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  const getProtectionLevelInfo = (level: string) => {
    switch (level) {
      case 'basic':
        return { color: 'bg-blue-500', text: 'Basic Protection', icon: <Shield className="h-3 w-3" /> };
      case 'standard':
        return { color: 'bg-green-500', text: 'Standard Protection', icon: <Shield className="h-3 w-3" /> };
      case 'enhanced':
        return { color: 'bg-orange-500', text: 'Enhanced Protection', icon: <Crown className="h-3 w-3" /> };
      case 'maximum':
        return { color: 'bg-red-500', text: 'Maximum Protection', icon: <Lock className="h-3 w-3" /> };
      default:
        return { color: 'bg-gray-500', text: 'Unknown', icon: <Shield className="h-3 w-3" /> };
    }
  };

  const isFeatureAvailable = (feature: string) => {
    if (!subscription) return false;
    
    const plan = subscription.plan_id;
    
    switch (feature) {
      case 'basic_watermark':
        return ['starter', 'professional', 'enterprise'].includes(plan);
      case 'advanced_watermark':
        return ['professional', 'enterprise'].includes(plan);
      case 'maximum_protection':
        return plan === 'enterprise';
      case 'blockchain_verification':
        return ['professional', 'enterprise'].includes(plan);
      case 'bulk_processing':
        return ['professional', 'enterprise'].includes(plan);
      default:
        return false;
    }
  };

  const processWatermarks = useCallback(async () => {
    if (!files.length) {
      toast({
        title: "No files selected",
        description: "Please select files to watermark",
        variant: "destructive"
      });
      return;
    }

    if (!isFeatureAvailable('basic_watermark')) {
      toast({
        title: "Feature not available",
        description: "Advanced watermarking requires Starter plan or higher",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    try {
      const watermarkResults: WatermarkResult[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress((i / files.length) * 100);
        
        // Apply protection level restrictions
        let processOptions = { ...options };
        
        if (!isFeatureAvailable('advanced_watermark')) {
          processOptions.protectionLevel = 'basic';
          processOptions.encryption = false;
          processOptions.digitalSignature = false;
        }
        
        if (!isFeatureAvailable('maximum_protection')) {
          processOptions.protectionLevel = processOptions.protectionLevel === 'maximum' ? 'enhanced' : processOptions.protectionLevel;
        }
        
        if (!isFeatureAvailable('blockchain_verification')) {
          processOptions.blockchainVerification = false;
        }

        const result = await advancedWatermarkService.applyWatermark(file, processOptions);
        watermarkResults.push(result);
        
        if (!result.success) {
          toast({
            title: `Failed to watermark ${file.name}`,
            description: result.error || 'Unknown error occurred',
            variant: "destructive"
          });
        }
      }

      setResults(watermarkResults);
      setProgress(100);
      
      const successCount = watermarkResults.filter(r => r.success).length;
      toast({
        title: "Watermarking complete",
        description: `Successfully watermarked ${successCount} of ${files.length} files`,
      });

      onWatermarkComplete?.(watermarkResults);
    } catch (error) {
      toast({
        title: "Processing failed",
        description: "An error occurred during watermarking",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [files, options, onWatermarkComplete, toast, isFeatureAvailable]);

  const downloadWatermarkedFile = (result: WatermarkResult, originalFile: File) => {
    if (!result.watermarkedBlob) return;
    
    const url = URL.createObjectURL(result.watermarkedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `watermarked_${originalFile.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

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
    setUploadedFiles(prev => [...prev, ...droppedFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Advanced Watermark Protection
          </CardTitle>
          <CardDescription>
            Protect your files with advanced multi-format watermarking technology
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="settings" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="files">Files ({files.length})</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Basic Settings
                  </h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="watermark-text">Watermark Text</Label>
                    <Input
                      id="watermark-text"
                      value={options.text || ''}
                      onChange={(e) => updateOption('text', e.target.value)}
                      placeholder="Enter watermark text"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="watermark-type">Watermark Type</Label>
                    <Select 
                      value={options.type} 
                      onValueChange={(value: any) => updateOption('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visible">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Visible
                          </div>
                        </SelectItem>
                        <SelectItem value="invisible">
                          <div className="flex items-center gap-2">
                            <EyeOff className="h-4 w-4" />
                            Invisible
                          </div>
                        </SelectItem>
                        <SelectItem value="hybrid">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            Hybrid (Recommended)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="protection-level">Protection Level</Label>
                    <Select 
                      value={options.protectionLevel} 
                      onValueChange={(value: any) => updateOption('protectionLevel', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem 
                          value="enhanced" 
                          disabled={!isFeatureAvailable('advanced_watermark')}
                        >
                          Enhanced {!isFeatureAvailable('advanced_watermark') && '(Pro+)'}
                        </SelectItem>
                        <SelectItem 
                          value="maximum" 
                          disabled={!isFeatureAvailable('maximum_protection')}
                        >
                          Maximum {!isFeatureAvailable('maximum_protection') && '(Enterprise)'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Visual Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium">Visual Settings</h4>
                  
                  {(options.type === 'visible' || options.type === 'hybrid') && (
                    <>
                      <div className="space-y-2">
                        <Label>Opacity: {Math.round((options.opacity || 0.3) * 100)}%</Label>
                        <Slider
                          value={[options.opacity || 0.3]}
                          onValueChange={(value) => updateOption('opacity', value[0])}
                          min={0.1}
                          max={0.8}
                          step={0.1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Size: {options.size}px</Label>
                        <Slider
                          value={[options.size || 16]}
                          onValueChange={(value) => updateOption('size', value[0])}
                          min={10}
                          max={48}
                          step={2}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="watermark-position">Position</Label>
                        <Select 
                          value={options.position} 
                          onValueChange={(value: any) => updateOption('position', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="top-left">Top Left</SelectItem>
                            <SelectItem value="top-right">Top Right</SelectItem>
                            <SelectItem value="bottom-left">Bottom Left</SelectItem>
                            <SelectItem value="bottom-right">Bottom Right</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Advanced Features */}
              <div className="space-y-4">
                <h4 className="font-medium">Advanced Features</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="timestamping"
                      checked={options.timestamping}
                      onCheckedChange={(checked) => updateOption('timestamping', checked)}
                    />
                    <Label htmlFor="timestamping" className="text-sm">Timestamping</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="encryption"
                      checked={options.encryption && isFeatureAvailable('advanced_watermark')}
                      onCheckedChange={(checked) => updateOption('encryption', checked)}
                      disabled={!isFeatureAvailable('advanced_watermark')}
                    />
                    <Label htmlFor="encryption" className="text-sm">
                      Encryption {!isFeatureAvailable('advanced_watermark') && '(Pro+)'}
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="digital-signature"
                      checked={options.digitalSignature && isFeatureAvailable('advanced_watermark')}
                      onCheckedChange={(checked) => updateOption('digitalSignature', checked)}
                      disabled={!isFeatureAvailable('advanced_watermark')}
                    />
                    <Label htmlFor="digital-signature" className="text-sm">
                      Digital Signature {!isFeatureAvailable('advanced_watermark') && '(Pro+)'}
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="blockchain"
                      checked={options.blockchainVerification && isFeatureAvailable('blockchain_verification')}
                      onCheckedChange={(checked) => updateOption('blockchainVerification', checked)}
                      disabled={!isFeatureAvailable('blockchain_verification')}
                    />
                    <Label htmlFor="blockchain" className="text-sm">
                      Blockchain {!isFeatureAvailable('blockchain_verification') && '(Pro+)'}
                    </Label>
                  </div>
                </div>
              </div>

              <Button 
                onClick={processWatermarks} 
                disabled={isProcessing || !files.length}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Processing... ({Math.round(progress)}%)
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Apply Watermarks ({files.length} files)
                  </>
                )}
              </Button>

              {isProcessing && (
                <Progress value={progress} className="w-full" />
              )}
            </TabsContent>

            <TabsContent value="files" className="space-y-4">
              {/* Upload Interface */}
              {propFiles.length === 0 && (
                <Card>
                  <CardContent className="pt-6">
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
                      <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        Drop files here or click to upload
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Supports all file types: images, videos, audio, documents
                      </p>
                      <Input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        id="advanced-file-upload"
                        accept="*/*"
                      />
                      <Button asChild>
                        <label htmlFor="advanced-file-upload" className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Select Files
                        </label>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {files.length === 0 ? (
                !propFiles.length && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Upload files above to start watermarking.
                    </AlertDescription>
                  </Alert>
                )
              ) : (
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getFileTypeIcon(advancedWatermarkService['detectFileType'](file))}
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {advancedWatermarkService['detectFileType'](file)}
                        </Badge>
                        {propFiles.length === 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFile(index)}
                          >
                            ✕
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              {results.length === 0 ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No watermarking results yet. Process files first.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {results.map((result, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="font-medium">{files[index]?.name}</span>
                        </div>
                        {result.success && result.watermarkedBlob && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadWatermarkedFile(result, files[index])}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Type</p>
                          <p>{result.fileType}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Protection</p>
                          <Badge className={getProtectionLevelInfo(result.protectionLevel).color}>
                            {getProtectionLevelInfo(result.protectionLevel).icon}
                            {getProtectionLevelInfo(result.protectionLevel).text}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Size Change</p>
                          <p>
                            {result.success 
                              ? `+${((result.watermarkedSize - result.originalSize) / result.originalSize * 100).toFixed(1)}%`
                              : 'N/A'
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Watermark ID</p>
                          <p className="font-mono text-xs">{result.watermarkId}</p>
                        </div>
                      </div>
                      
                      {result.error && (
                        <Alert className="mt-2" variant="destructive">
                          <AlertDescription>{result.error}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedWatermarkProtection;