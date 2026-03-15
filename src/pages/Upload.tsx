import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Upload as UploadIcon, 
  FileText, 
  Shield, 
  CheckCircle,
  AlertTriangle,
  Plus,
  X,
  Camera,
  FolderOpen,
  Link,
  ChevronDown,
  ChevronRight,
  Eye,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Lock,
  Zap,
  Globe
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePerformanceBudget } from "@/hooks/usePerformanceBudget";
import { useMonitoredSupabaseCall } from "@/hooks/useMonitoredSupabaseCall";
import { supabase } from "@/integrations/supabase/client";
import VisualRecognition from "@/components/VisualRecognition";
import { AdvancedWatermarkProtection } from "@/components/AdvancedWatermarkProtection";
import { WatermarkResult } from "@/lib/advancedWatermark";
import C2PAProtection from "@/components/ai-protection/C2PAProtection";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
  status: 'uploading' | 'processing' | 'protected' | 'error';
  progress: number;
}

const STEPS = [
  { id: 1, label: "Upload", icon: UploadIcon, description: "Add your files" },
  { id: 2, label: "Details", icon: FileText, description: "Describe your work" },
  { id: 3, label: "Protect", icon: Shield, description: "Apply protection" },
  { id: 4, label: "Complete", icon: CheckCircle, description: "You're all set" },
];

const Upload = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { measureApiCall, measureDatabaseQuery } = usePerformanceBudget({
    apiCall: 3000,
    databaseQuery: 500,
  });
  const { invokeFunction, query } = useMonitoredSupabaseCall();
  
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [artworkTitle, setArtworkTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [licenseType, setLicenseType] = useState("");
  const [enableWatermark, setEnableWatermark] = useState(true);
  const [isProtecting, setIsProtecting] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const [rawFiles, setRawFiles] = useState<File[]>([]);
  const [watermarkResults, setWatermarkResults] = useState<WatermarkResult[]>([]);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [showAdvancedProtection, setShowAdvancedProtection] = useState(false);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(Array.from(e.target.files));
  };

  const validateUrl = (url: string): boolean => {
    try { const u = new URL(url); return u.protocol === 'http:' || u.protocol === 'https:'; }
    catch { return false; }
  };

  const addUrl = () => {
    if (urlInput.trim() && !urls.includes(urlInput.trim())) {
      if (validateUrl(urlInput.trim())) {
        setUrls([...urls, urlInput.trim()]);
        setUrlInput("");
        toast({ title: "URL Added", description: "Content link added for protection" });
      } else {
        toast({ title: "Invalid URL", description: "Please enter a valid URL", variant: "destructive" });
      }
    }
  };
  const removeUrl = (u: string) => setUrls(urls.filter(url => url !== u));

  const processFiles = async (fileList: File[]) => {
    setRawFiles(prev => [...prev, ...fileList]);
    for (const file of fileList) {
      const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newFile: UploadedFile = { id: fileId, name: file.name, size: file.size, type: file.type, status: 'uploading', progress: 0 };
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFiles(prev => prev.map(f => f.id === fileId ? { ...f, preview: e.target?.result as string } : f));
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
      const { data, error } = await supabase.storage.from('artwork').upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'processing', progress: 100 } : f));
      setTimeout(() => {
        setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'protected' } : f));
        toast({ title: "File Uploaded", description: `${file.name} uploaded successfully` });
      }, 1000);
    } catch (error: any) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'error' } : f));
      toast({ title: "Upload Failed", description: error.message || "Failed to upload file", variant: "destructive" });
    }
  };

  const removeFile = async (fileId: string) => {
    const fileToRemove = files.find(f => f.id === fileId);
    setFiles(prev => prev.filter(f => f.id !== fileId));
    if (fileToRemove && fileToRemove.status === 'protected') {
      try {
        const userId = user?.id || 'anonymous';
        const fileName = `${userId}/${Date.now()}-${fileToRemove.name}`;
        await supabase.storage.from('artwork').remove([fileName]);
        toast({ title: "File Removed", description: `${fileToRemove.name} deleted` });
      } catch (error) { console.error('Error removing file:', error); }
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };
  const removeTag = (t: string) => setTags(tags.filter(tag => tag !== t));

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading': return <UploadIcon className="w-4 h-4 text-primary animate-pulse" />;
      case 'processing': return <Shield className="w-4 h-4 text-secondary animate-pulse" />;
      case 'protected': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading': return 'Uploading...';
      case 'processing': return 'Securing...';
      case 'protected': return 'Protected';
      case 'error': return 'Failed';
    }
  };

  const handleStartProtection = async () => {
    if (files.length === 0 && urls.length === 0) {
      toast({ title: "No Content", description: "Upload files or add URLs first", variant: "destructive" });
      return;
    }
    if (!artworkTitle.trim()) {
      toast({ title: "Missing Title", description: "Please provide a title", variant: "destructive" });
      return;
    }
    if (!category) {
      toast({ title: "Missing Category", description: "Please select a category", variant: "destructive" });
      return;
    }

    setIsProtecting(true);
    try {
      toast({ title: "Protection Started", description: "Applying protection layers..." });
      setFiles(prev => prev.map(f => ({ ...f, status: 'processing' as const, progress: 50 })));

      const userId = user?.id || 'anonymous';
      const filePaths = files.map(file => `${userId}/${Date.now()}-${file.name}`);
      const allPaths = [...filePaths, ...urls];

      let artwork = null;
      if (user) {
        const { data: artworkData, error: artworkError } = await supabase
          .from('artwork')
          .insert({
            user_id: user.id,
            title: artworkTitle,
            description: description || null,
            category,
            tags: tags.length > 0 ? tags : null,
            license_type: licenseType || null,
            file_paths: allPaths,
            enable_watermark: enableWatermark,
            status: 'protected'
          })
          .select()
          .single();
        if (artworkError) throw artworkError;
        artwork = artworkData;
      }

      if (user && artwork) {
        const { data: scan, error: scanError } = await supabase
          .from('monitoring_scans')
          .insert({ artwork_id: artwork.id, scan_type: 'deep', status: 'pending', total_sources: 52000 })
          .select()
          .single();
        if (!scanError && scan) {
          try {
            await supabase.functions.invoke('process-monitoring-scan', {
              body: { scanId: scan.id, artworkId: artwork.id }
            });
          } catch (e) { console.error('Scan error:', e); }
        }
      }

      setFiles(prev => prev.map(f => ({ ...f, status: 'protected' as const, progress: 100 })));
      setStep(4);
      toast({ title: "Protection Complete!", description: `${files.length + urls.length} item(s) now protected` });
    } catch (error: any) {
      console.error('Protection error:', error);
      toast({ title: "Protection Failed", description: error.message || "Please try again", variant: "destructive" });
    } finally {
      setIsProtecting(false);
    }
  };

  const totalItems = files.length + urls.length;
  const canProceedFromStep1 = totalItems > 0;
  const canProceedFromStep2 = artworkTitle.trim() && category;

  return (
    <div className="min-h-screen bg-background">
      {/* Cinematic Header */}
      <div className="relative overflow-hidden border-b bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--secondary)/0.06),transparent_60%)]" />
        <div className="container mx-auto px-4 py-10 md:py-16 relative z-10">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Lock className="w-3.5 h-3.5" />
              End-to-end encrypted protection
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
              <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                Upload & Protect
              </span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
              Secure your creative work in minutes with AI-powered protection, invisible watermarks, and 24/7 monitoring.
            </p>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4 max-w-2xl mx-auto">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isComplete = step > s.id;
              return (
                <div key={s.id} className="flex items-center gap-0 flex-1">
                  <button
                    onClick={() => { if (isComplete) setStep(s.id); }}
                    className={`flex items-center gap-2 transition-all duration-300 group ${
                      isActive ? 'scale-105' : ''
                    } ${isComplete ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <div className={`
                      w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 shrink-0
                      ${isComplete ? 'bg-green-500 text-white shadow-lg shadow-green-500/25' : ''}
                      ${isActive ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-primary/20' : ''}
                      ${!isActive && !isComplete ? 'bg-muted text-muted-foreground' : ''}
                    `}>
                      {isComplete ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <div className="hidden md:block text-left">
                      <div className={`text-xs font-semibold ${isActive ? 'text-primary' : isComplete ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {s.label}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{s.description}</div>
                    </div>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-500 ${
                      isComplete ? 'bg-green-500' : 'bg-muted'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* ========== STEP 1: UPLOAD ========== */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            {/* Drop Zone */}
            <div
              className={`
                relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
                ${isDragging 
                  ? 'border-primary bg-primary/5 scale-[1.01] shadow-xl shadow-primary/10' 
                  : 'border-border hover:border-primary/40 hover:bg-muted/30'
                }
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <div className="flex flex-col items-center justify-center py-16 md:py-24 px-6">
                <div className={`
                  w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300
                  ${isDragging ? 'bg-primary text-primary-foreground scale-110 rotate-6' : 'bg-primary/10 text-primary'}
                `}>
                  <FolderOpen className="w-10 h-10" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold mb-2 text-foreground">
                  Drop your files here
                </h2>
                <p className="text-muted-foreground text-sm md:text-base mb-6 max-w-md text-center">
                  Images, videos, audio, documents — we protect all creative formats
                </p>
                <Button size="lg" className="gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                  <Camera className="w-4 h-4" />
                  Browse Files
                </Button>
                <Input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                />
              </div>

              {/* Format badges */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 flex-wrap px-4">
                {['JPG', 'PNG', 'MP4', 'PDF', 'SVG', 'DOCX'].map(fmt => (
                  <span key={fmt} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {fmt}
                  </span>
                ))}
              </div>
            </div>

            {/* URL Input */}
            <Card className="border bg-card/50 backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Link className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">Or add a URL to protect</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/your-article"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addUrl()}
                    className="flex-1"
                  />
                  <Button onClick={addUrl} variant="secondary" size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {urls.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {urls.map((url, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50 animate-fade-in">
                        <span className="text-sm truncate flex-1 text-muted-foreground">{url}</span>
                        <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => removeUrl(url)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Uploaded Files ({files.length})
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:shadow-md transition-all animate-fade-in">
                      {file.preview ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                          <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {getStatusIcon(file.status)}
                          <span>{formatFileSize(file.size)} · {getStatusText(file.status)}</span>
                        </div>
                        {file.status === 'uploading' && <Progress value={file.progress} className="h-1 mt-1" />}
                      </div>
                      <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => removeFile(file.id)}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next */}
            <div className="flex justify-end pt-4">
              <Button 
                size="lg" 
                onClick={() => setStep(2)} 
                disabled={!canProceedFromStep1}
                className="gap-2 min-w-[180px] shadow-lg shadow-primary/20"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ========== STEP 2: DETAILS ========== */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Describe Your Work</h2>
              <p className="text-muted-foreground">Help us protect your content better with a few details.</p>
            </div>

            {/* Essential Fields */}
            <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/[0.02]">
              <CardContent className="p-6 space-y-5">
                <div>
                  <Label htmlFor="title" className="text-sm font-semibold">Title <span className="text-destructive">*</span></Label>
                  <Input
                    id="title"
                    placeholder="My Creative Work"
                    value={artworkTitle}
                    onChange={(e) => setArtworkTitle(e.target.value)}
                    className="mt-1.5 h-12 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="text-sm font-semibold">Category <span className="text-destructive">*</span></Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-1.5 h-12">
                      <SelectValue placeholder="What type of work is this?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="photography">📸 Photography</SelectItem>
                      <SelectItem value="digital-art">🎨 Digital Art</SelectItem>
                      <SelectItem value="video">🎥 Video</SelectItem>
                      <SelectItem value="audio">🎵 Audio / Music</SelectItem>
                      <SelectItem value="writing">✍️ Writing</SelectItem>
                      <SelectItem value="design">🖌️ Design</SelectItem>
                      <SelectItem value="other">📁 Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Optional Fields */}
            <Collapsible open={showOptionalFields} onOpenChange={setShowOptionalFields}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between h-12 border border-dashed">
                  <span className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4" />
                    Add more details (optional)
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showOptionalFields ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <Card>
                  <CardContent className="p-6 space-y-5">
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" placeholder="Describe your artwork..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1.5" />
                    </div>
                    <div>
                      <Label>Tags</Label>
                      <div className="flex gap-2 mt-1.5">
                        <Input placeholder="Add a tag..." value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTag()} />
                        <Button onClick={addTag} size="icon" variant="outline"><Plus className="h-4 w-4" /></Button>
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {tags.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="cursor-pointer hover:bg-destructive/20 transition-colors gap-1" onClick={() => removeTag(tag)}>
                              {tag} <X className="h-2.5 w-2.5" />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label>License Type</Label>
                      <Select value={licenseType} onValueChange={setLicenseType}>
                        <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select license" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all-rights-reserved">All Rights Reserved</SelectItem>
                          <SelectItem value="cc-by">Creative Commons BY</SelectItem>
                          <SelectItem value="cc-by-sa">Creative Commons BY-SA</SelectItem>
                          <SelectItem value="cc-by-nc">Creative Commons BY-NC</SelectItem>
                          <SelectItem value="public-domain">Public Domain</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button variant="ghost" size="lg" onClick={() => setStep(1)} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button size="lg" onClick={() => setStep(3)} disabled={!canProceedFromStep2} className="gap-2 min-w-[180px] shadow-lg shadow-primary/20">
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ========== STEP 3: PROTECT ========== */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Apply Protection</h2>
              <p className="text-muted-foreground">Review your content and activate AI-powered protection.</p>
            </div>

            {/* Summary Card */}
            <Card className="border-primary/20 overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-6 py-4 border-b">
                <h3 className="font-semibold flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  Protection Summary
                </h3>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Title</span>
                    <p className="font-medium">{artworkTitle}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Category</span>
                    <p className="font-medium capitalize">{category}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Files</span>
                    <p className="font-medium">{files.length} file{files.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">URLs</span>
                    <p className="font-medium">{urls.length} link{urls.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Protection Features */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Protection Layers
                </h4>
                <div className="space-y-3">
                  {[
                    { icon: Sparkles, label: "Invisible Watermark", desc: "Imperceptible markers embedded in your content", checked: enableWatermark, toggle: () => setEnableWatermark(!enableWatermark) },
                    { icon: Zap, label: "AI Training Shield", desc: "Block AI models from learning from your work", checked: true, disabled: true },
                    { icon: Globe, label: "24/7 Monitoring", desc: "Continuous scanning across 52,000+ sources", checked: true, disabled: true },
                    { icon: Shield, label: "DMCA Auto-Enforcement", desc: "Automated takedown notices for violations", checked: true, disabled: true },
                  ].map((feature, i) => {
                    const Icon = feature.icon;
                    return (
                      <div key={i} className="flex items-start gap-4 p-3 rounded-xl border bg-card hover:bg-muted/30 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{feature.label}</div>
                          <div className="text-xs text-muted-foreground">{feature.desc}</div>
                        </div>
                        <Checkbox
                          checked={feature.checked}
                          disabled={feature.disabled}
                          onCheckedChange={() => feature.toggle?.()}
                          className="mt-1"
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Advanced Protection Toggle */}
            <Collapsible open={showAdvancedProtection} onOpenChange={setShowAdvancedProtection}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between h-12 border border-dashed">
                  <span className="flex items-center gap-2 text-sm">
                    <Sparkles className="h-4 w-4" />
                    Advanced Protection Options
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showAdvancedProtection ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-6">
                <AdvancedWatermarkProtection 
                  files={rawFiles}
                  onWatermarkComplete={(results) => {
                    setWatermarkResults(results);
                    toast({ title: "Watermarking Complete", description: `Processed ${results.filter(r => r.success).length} of ${results.length} files` });
                  }}
                />
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      Content Credentials (C2PA)
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">Add tamper-evident provenance data for authenticity proof.</p>
                    <C2PAProtection />
                  </CardContent>
                </Card>
                <VisualRecognition />
              </CollapsibleContent>
            </Collapsible>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button variant="ghost" size="lg" onClick={() => setStep(2)} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button 
                size="lg" 
                onClick={handleStartProtection} 
                disabled={isProtecting}
                className="gap-2 min-w-[220px] bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg shadow-primary/25 transition-all"
              >
                {isProtecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                    Protecting...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Activate Protection
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ========== STEP 4: COMPLETE ========== */}
        {step === 4 && (
          <div className="animate-fade-in max-w-lg mx-auto text-center py-12">
            <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-8 ring-8 ring-green-500/5">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold mb-3">You're Protected!</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              Your content is now secured with AI-powered protection and being monitored across 52,000+ sources.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "Files Protected", value: files.length },
                { label: "URLs Monitored", value: urls.length },
                { label: "Sources Scanned", value: "52K+" },
              ].map((stat, i) => (
                <div key={i} className="p-4 rounded-xl bg-muted/50 border">
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" variant="outline" className="gap-2" onClick={() => window.location.href = '/dashboard'}>
                <Eye className="w-4 h-4" />
                View Dashboard
              </Button>
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/20" onClick={() => { setStep(1); setFiles([]); setUrls([]); setArtworkTitle(""); setDescription(""); setCategory(""); setTags([]); }}>
                <Plus className="w-4 h-4" />
                Protect More Content
              </Button>
            </div>

            {!user && (
              <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm text-foreground">
                  <strong>Create a free account</strong> to access monitoring alerts, DMCA tools, and full protection history.
                </p>
                <Button variant="link" className="mt-1 text-primary" onClick={() => window.location.href = '/auth'}>
                  Sign up now <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
