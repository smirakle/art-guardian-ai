import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, Eye, EyeOff, Zap, FileImage, Video, AudioLines, FileText, File,
  Download, CheckCircle, AlertTriangle, Settings, Crown, Lock, Upload, FolderOpen, FileDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { advancedWatermarkService, AdvancedWatermarkOptions, WatermarkResult } from '@/lib/advancedWatermark';
import { WatermarkProofGenerator, WatermarkProofData } from '@/lib/watermarkProof';

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
  
  const files = propFiles.length > 0 ? propFiles : uploadedFiles;
  
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
    videoOptions: { frameInterval: 30, quality: 'medium', preserveAudio: true },
    audioOptions: { frequency: 'inaudible', embedMethod: 'lsb' },
    textOptions: { embedMethod: 'metadata', preserveFormatting: true },
    documentOptions: { embedLocation: 'metadata', preserveLayout: true }
  });

  const updateOption = <K extends keyof AdvancedWatermarkOptions>(key: K, value: AdvancedWatermarkOptions[K]) => {
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
      case 'basic': return { className: 'bg-primary/10 text-primary border-primary/20', text: 'Basic', icon: <Shield className="h-3 w-3" /> };
      case 'standard': return { className: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20', text: 'Standard', icon: <Shield className="h-3 w-3" /> };
      case 'enhanced': return { className: 'bg-secondary/10 text-secondary border-secondary/20', text: 'Enhanced', icon: <Crown className="h-3 w-3" /> };
      case 'maximum': return { className: 'bg-accent/10 text-accent border-accent/20', text: 'Maximum', icon: <Lock className="h-3 w-3" /> };
      default: return { className: 'bg-muted text-muted-foreground', text: 'Unknown', icon: <Shield className="h-3 w-3" /> };
    }
  };

  const isFeatureAvailable = (feature: string) => {
    if (!subscription) return false;
    const plan = subscription.plan_id;
    switch (feature) {
      case 'basic_watermark': return ['starter', 'professional', 'enterprise'].includes(plan);
      case 'advanced_watermark': return ['professional', 'enterprise'].includes(plan);
      case 'maximum_protection': return plan === 'enterprise';
      case 'blockchain_verification': return ['professional', 'enterprise'].includes(plan);
      case 'bulk_processing': return ['professional', 'enterprise'].includes(plan);
      default: return false;
    }
  };

  const processWatermarks = useCallback(async () => {
    if (!files.length) {
      toast({ title: "No files selected", description: "Please select files to watermark", variant: "destructive" });
      return;
    }
    if (!isFeatureAvailable('basic_watermark')) {
      toast({ title: "Feature not available", description: "Advanced watermarking requires Starter plan or higher", variant: "destructive" });
      return;
    }
    setIsProcessing(true); setProgress(0); setResults([]);
    try {
      const watermarkResults: WatermarkResult[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress((i / files.length) * 100);
        let processOptions = { ...options };
        if (!isFeatureAvailable('advanced_watermark')) { processOptions.protectionLevel = 'basic'; processOptions.encryption = false; processOptions.digitalSignature = false; }
        if (!isFeatureAvailable('maximum_protection')) { processOptions.protectionLevel = processOptions.protectionLevel === 'maximum' ? 'enhanced' : processOptions.protectionLevel; }
        if (!isFeatureAvailable('blockchain_verification')) { processOptions.blockchainVerification = false; }
        const result = await advancedWatermarkService.applyWatermark(file, processOptions);
        watermarkResults.push(result);
        if (!result.success) { toast({ title: `Failed: ${file.name}`, description: result.error || 'Unknown error', variant: "destructive" }); }
      }
      setResults(watermarkResults); setProgress(100);
      const successCount = watermarkResults.filter(r => r.success).length;
      toast({ title: "Watermarking complete", description: `${successCount} of ${files.length} files processed` });
      onWatermarkComplete?.(watermarkResults);
    } catch (error) {
      toast({ title: "Processing failed", description: "An error occurred during watermarking", variant: "destructive" });
    } finally { setIsProcessing(false); }
  }, [files, options, onWatermarkComplete, toast, isFeatureAvailable]);

  const downloadWatermarkedFile = (result: WatermarkResult, originalFile: File) => {
    if (!result.watermarkedBlob) return;
    const url = URL.createObjectURL(result.watermarkedBlob);
    const a = document.createElement('a'); a.href = url; a.download = `watermarked_${originalFile.name}`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const downloadProofReport = (result: WatermarkResult, file: File, format: 'pdf' | 'txt' = 'pdf') => {
    if (!result.success || !result.watermarkId) return;
    const proofData: WatermarkProofData = { fileName: file.name, watermarkId: result.watermarkId, detectionTimestamp: new Date(), confidence: 99.5, scanType: 'Watermark Embedding Verification', artworkId: result.watermarkId.slice(0, 8) };
    let blob: Blob;
    if (format === 'pdf') { blob = WatermarkProofGenerator.generateProofCertificate(proofData); }
    else { blob = WatermarkProofGenerator.generateTextProof(proofData); }
    WatermarkProofGenerator.downloadProof(blob, file.name.replace(/\.[^/.]+$/, ""), format);
    toast({ title: "Proof Downloaded", description: `Certificate downloaded as ${format.toUpperCase()}` });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) { setUploadedFiles(prev => [...prev, ...Array.from(e.target.files!)]); }
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); setUploadedFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]); };
  const removeFile = (index: number) => { setUploadedFiles(prev => prev.filter((_, i) => i !== index)); };

  return (
    <div className={`${className}`}>
      <Card className="border bg-card/50 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Advanced Watermark Protection</h3>
              <p className="text-xs text-muted-foreground">Multi-format invisible & visible watermarking</p>
            </div>
            {files.length > 0 && (
              <Badge variant="secondary" className="ml-auto">{files.length} file{files.length !== 1 ? 's' : ''}</Badge>
            )}
          </div>
        </div>

        <CardContent className="p-0">
          <Tabs defaultValue="settings" className="w-full">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-xl h-auto">
                <TabsTrigger value="settings" className="rounded-lg py-2.5 text-xs font-medium data-[state=active]:shadow-md data-[state=active]:bg-background">
                  <Settings className="w-3.5 h-3.5 mr-1.5" /> Settings
                </TabsTrigger>
                <TabsTrigger value="files" className="rounded-lg py-2.5 text-xs font-medium data-[state=active]:shadow-md data-[state=active]:bg-background">
                  <FileImage className="w-3.5 h-3.5 mr-1.5" /> Files ({files.length})
                </TabsTrigger>
                <TabsTrigger value="results" className="rounded-lg py-2.5 text-xs font-medium data-[state=active]:shadow-md data-[state=active]:bg-background">
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Results
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="settings" className="px-6 pb-6 pt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Settings */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Core Settings</h4>
                  <div className="space-y-2">
                    <Label htmlFor="watermark-text" className="text-xs font-medium">Watermark Text</Label>
                    <Input id="watermark-text" value={options.text || ''} onChange={(e) => updateOption('text', e.target.value)} placeholder="Enter watermark text" className="h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Watermark Type</Label>
                    <Select value={options.type} onValueChange={(value: any) => updateOption('type', value)}>
                      <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visible"><div className="flex items-center gap-2"><Eye className="h-3.5 w-3.5" /> Visible</div></SelectItem>
                        <SelectItem value="invisible"><div className="flex items-center gap-2"><EyeOff className="h-3.5 w-3.5" /> Invisible</div></SelectItem>
                        <SelectItem value="hybrid"><div className="flex items-center gap-2"><Zap className="h-3.5 w-3.5" /> Hybrid (Recommended)</div></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Protection Level</Label>
                    <Select value={options.protectionLevel} onValueChange={(value: any) => updateOption('protectionLevel', value)}>
                      <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="enhanced" disabled={!isFeatureAvailable('advanced_watermark')}>Enhanced {!isFeatureAvailable('advanced_watermark') && '(Pro+)'}</SelectItem>
                        <SelectItem value="maximum" disabled={!isFeatureAvailable('maximum_protection')}>Maximum {!isFeatureAvailable('maximum_protection') && '(Enterprise)'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Visual Settings */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Visual Settings</h4>
                  {(options.type === 'visible' || options.type === 'hybrid') && (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium">Opacity</Label>
                          <span className="text-xs font-mono text-muted-foreground">{Math.round((options.opacity || 0.3) * 100)}%</span>
                        </div>
                        <Slider value={[options.opacity || 0.3]} onValueChange={(v) => updateOption('opacity', v[0])} min={0.1} max={0.8} step={0.1} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium">Size</Label>
                          <span className="text-xs font-mono text-muted-foreground">{options.size}px</span>
                        </div>
                        <Slider value={[options.size || 16]} onValueChange={(v) => updateOption('size', v[0])} min={10} max={48} step={2} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-medium">Position</Label>
                        <Select value={options.position} onValueChange={(value: any) => updateOption('position', value)}>
                          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
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
                  {options.type === 'invisible' && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border">
                      <EyeOff className="w-5 h-5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Invisible mode — watermark is embedded in file metadata and pixel data without visual changes.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Advanced Features */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Advanced Features</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'timestamping', label: 'Timestamping', checked: options.timestamping, available: true },
                    { id: 'encryption', label: 'Encryption', checked: options.encryption, available: isFeatureAvailable('advanced_watermark'), pro: true },
                    { id: 'digital-signature', label: 'Digital Signature', checked: options.digitalSignature, available: isFeatureAvailable('advanced_watermark'), pro: true },
                    { id: 'blockchain', label: 'Blockchain', checked: options.blockchainVerification, available: isFeatureAvailable('blockchain_verification'), pro: true },
                  ].map((feat) => (
                    <div key={feat.id} className={`flex items-center gap-2.5 p-3 rounded-xl border transition-colors ${feat.checked && feat.available ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'}`}>
                      <Switch
                        id={feat.id}
                        checked={feat.checked && feat.available}
                        onCheckedChange={(checked) => {
                          const key = feat.id === 'digital-signature' ? 'digitalSignature' : feat.id === 'blockchain' ? 'blockchainVerification' : feat.id as keyof AdvancedWatermarkOptions;
                          updateOption(key as any, checked);
                        }}
                        disabled={!feat.available}
                        className="scale-90"
                      />
                      <Label htmlFor={feat.id} className="text-xs cursor-pointer">
                        {feat.label}
                        {feat.pro && !feat.available && <span className="text-muted-foreground ml-1">(Pro)</span>}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <Button onClick={processWatermarks} disabled={isProcessing || !files.length} className="w-full gap-2 h-11 shadow-lg shadow-primary/20" size="lg">
                {isProcessing ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" /> Processing ({Math.round(progress)}%)</>
                ) : (
                  <><Shield className="h-4 w-4" /> Apply Watermarks ({files.length} files)</>
                )}
              </Button>
              {isProcessing && <Progress value={progress} className="h-1.5" />}
            </TabsContent>

            <TabsContent value="files" className="px-6 pb-6 pt-4 space-y-4">
              {propFiles.length === 0 && (
                <div
                  className={`rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer ${isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border hover:border-primary/40'}`}
                  onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                  onClick={() => document.getElementById('advanced-file-upload')?.click()}
                >
                  <div className="flex flex-col items-center justify-center py-12 px-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all ${isDragging ? 'bg-primary text-primary-foreground scale-110' : 'bg-muted text-muted-foreground'}`}>
                      <FolderOpen className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-medium mb-1">Drop files or click to upload</p>
                    <p className="text-xs text-muted-foreground">Images, videos, audio, documents</p>
                  </div>
                  <Input type="file" multiple onChange={handleFileUpload} className="hidden" id="advanced-file-upload" accept="*/*" />
                </div>
              )}
              {files.length === 0 ? (
                !propFiles.length && (
                  <div className="text-center py-8 text-sm text-muted-foreground">Upload files above to start watermarking</div>
                )
              ) : (
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-muted/30 transition-colors">
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        {getFileTypeIcon(advancedWatermarkService['detectFileType'](file))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">{advancedWatermarkService['detectFileType'](file)}</Badge>
                      {propFiles.length === 0 && (
                        <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => removeFile(index)}>
                          <span className="text-xs">✕</span>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="results" className="px-6 pb-6 pt-4 space-y-3">
              {results.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium mb-1">No results yet</p>
                  <p className="text-xs text-muted-foreground">Process files to see watermarking results</p>
                </div>
              ) : (
                results.map((result, index) => {
                  const levelInfo = getProtectionLevelInfo(result.protectionLevel);
                  return (
                    <div key={index} className="rounded-xl border overflow-hidden bg-card hover:shadow-md transition-all">
                      {/* Result header */}
                      <div className="flex items-center gap-3 px-4 py-3 border-b bg-muted/20">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${result.success ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
                          {result.success ? <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" /> : <AlertTriangle className="h-4 w-4 text-destructive" />}
                        </div>
                        <span className="text-sm font-medium truncate flex-1">{files[index]?.name}</span>
                        {result.success && result.watermarkedBlob && (
                          <div className="flex gap-1.5 shrink-0">
                            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => downloadWatermarkedFile(result, files[index])}>
                              <Download className="h-3 w-3" /> Download
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 text-xs gap-1.5" onClick={() => downloadProofReport(result, files[index], 'pdf')}>
                              <FileDown className="h-3 w-3" /> Proof
                            </Button>
                          </div>
                        )}
                      </div>
                      {/* Result details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 text-xs">
                        <div>
                          <span className="text-muted-foreground block mb-0.5">Type</span>
                          <span className="font-medium">{result.fileType}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block mb-0.5">Protection</span>
                          <Badge variant="outline" className={`text-[10px] ${levelInfo.className}`}>
                            {levelInfo.icon} {levelInfo.text}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground block mb-0.5">Size Change</span>
                          <span className="font-medium font-mono">{result.success ? `+${((result.watermarkedSize - result.originalSize) / result.originalSize * 100).toFixed(1)}%` : '—'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block mb-0.5">Watermark ID</span>
                          <span className="font-mono text-[10px] text-muted-foreground">{result.watermarkId}</span>
                        </div>
                      </div>
                      {result.error && (
                        <div className="px-4 pb-3">
                          <div className="text-xs text-destructive bg-destructive/5 p-2 rounded-lg">{result.error}</div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedWatermarkProtection;
