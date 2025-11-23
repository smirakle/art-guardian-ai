import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as exifr from 'exifr';
import { ShieldAlert, Upload, ScanSearch, Activity, Info, Sparkles } from 'lucide-react';
import { watermarkService } from '@/lib/watermark';

const bytes = (n: number) => {
  const s = ['B','KB','MB'];
  if (!n) return '0 B';
  const i = Math.floor(Math.log(n)/Math.log(1024));
  return `${(n/Math.pow(1024,i)).toFixed(1)} ${s[i]}`;
};

export default function ImageForgeryDetector() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [elaUrl, setElaUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any | null>(null);
  const [aiResult, setAiResult] = useState<{ confidence?: number; summary?: string } | null>(null);
  const [watermark, setWatermark] = useState<{ has: boolean; confidence: number; id?: string } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [elaScale, setElaScale] = useState<number[]>([20]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    document.title = 'Forgery Detection | Image Forensics & Provenance';
    const desc = 'Run ELA, metadata, watermark checks, and AI analysis to detect image tampering.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name','description'); document.head.appendChild(meta); }
    meta.setAttribute('content', desc);
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) { link = document.createElement('link'); link.setAttribute('rel','canonical'); document.head.appendChild(link); }
    link.setAttribute('href', window.location.origin + '/forgery-detection');
  }, []);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      toast({ title: 'Unsupported file', description: 'Please choose an image file.', variant: 'destructive' });
      return;
    }
    setFile(f);
    const url = URL.createObjectURL(f);
    if (src) URL.revokeObjectURL(src);
    setSrc(url);
    setElaUrl((u) => { if (u) URL.revokeObjectURL(u); return null; });
    setAiResult(null);
    setWatermark(null);
    setMetadata(null);
  };

  const runELA = async () => {
    if (!file || !src) return;
    try {
      setProcessing(true);
      const img = await loadImage(src);
      const baseCanvas = ensureCanvas(canvasRef, img.naturalWidth, img.naturalHeight);
      const ctx = baseCanvas.getContext('2d');
      if (!ctx) throw new Error('Canvas unsupported');
      ctx.drawImage(img, 0, 0);

      // Recompress as JPEG and compute error map
      const jpegData = baseCanvas.toDataURL('image/jpeg', 0.92);
      const jpegImg = await loadImage(jpegData);
      const tmp = ensureCanvas(undefined, img.naturalWidth, img.naturalHeight);
      const tctx = tmp.getContext('2d');
      if (!tctx) throw new Error('Canvas unsupported');
      tctx.drawImage(jpegImg, 0, 0);

      const a = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
      const b = tctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
      const out = ctx.createImageData(a.width, a.height);

      const scale = Math.max(1, Math.min(64, Math.floor(elaScale[0])));
      for (let i = 0; i < a.data.length; i += 4) {
        out.data[i]   = Math.min(255, Math.abs(a.data[i]   - b.data[i])   * scale);
        out.data[i+1] = Math.min(255, Math.abs(a.data[i+1] - b.data[i+1]) * scale);
        out.data[i+2] = Math.min(255, Math.abs(a.data[i+2] - b.data[i+2]) * scale);
        out.data[i+3] = 255;
      }
      ctx.putImageData(out, 0, 0);
      const url = baseCanvas.toDataURL('image/png');
      setElaUrl((u) => { if (u) URL.revokeObjectURL(u); return url; });
      toast({ title: 'ELA complete', description: 'Error Level Analysis heatmap generated.' });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'ELA failed', description: e?.message ?? 'Could not compute ELA', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const extractMetadata = async () => {
    if (!file) return;
    try {
      setProcessing(true);
      const exif = await exifr.parse(file).catch(() => null);
      setMetadata(exif || {});
      toast({ title: 'Metadata extracted', description: exif ? 'EXIF/XMP data found.' : 'No metadata present.' });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Metadata error', description: e?.message ?? 'Failed to read metadata', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const checkWatermark = async () => {
    if (!file) return;
    try {
      setProcessing(true);
      const res = await watermarkService.detectWatermark(file);
      setWatermark({ has: res.hasWatermark, confidence: res.confidence, id: res.watermarkId });
      toast({ title: 'Watermark check complete', description: res.hasWatermark ? 'Invisible watermark detected.' : 'No watermark found.' });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Watermark error', description: e?.message ?? 'Failed to check watermark', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const aiForgeryAnalysis = async () => {
    if (!file) {
      toast({ title: 'No file selected', description: 'Please upload an image first.', variant: 'destructive' });
      return;
    }
    try {
      setProcessing(true);
      console.log('Starting AI forgery analysis...');
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authentication required - please sign in');
      }
      console.log('User authenticated:', user.id);
      
      // Upload image to Supabase Storage to get a public URL
      const filePath = `forensics/${user.id}/${Date.now()}_${file.name}`;
      console.log('Uploading to:', filePath);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('artwork')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      console.log('Upload successful:', uploadData);
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('artwork')
        .getPublicUrl(filePath);
      console.log('Public URL:', publicUrl);
      
      // Call edge function with public URL
      console.log('Calling edge function...');
      const { data, error } = await supabase.functions.invoke('advanced-visual-analysis', {
        body: { 
          imageUrl: publicUrl,
          analysisTypes: ['deepfake_detection']
        }
      });
      
      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`Analysis failed: ${error.message}`);
      }
      console.log('Edge function response:', data);
      
      const deepfakeData = data?.results?.deepfake_detection;
      const confidence = Math.round((deepfakeData?.confidence ?? 0.5) * 100);
      
      setAiResult({ 
        confidence, 
        summary: deepfakeData?.analysis || 'AI analysis complete.' 
      });
      
      toast({ 
        title: 'AI analysis complete', 
        description: `AI confidence: ${confidence}%` 
      });
    } catch (e: any) {
      console.error('AI forgery analysis error:', e);
      toast({ 
        title: 'AI analysis failed', 
        description: e?.message ?? 'Could not analyze image', 
        variant: 'destructive' 
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" /> Forgery Detection
        </CardTitle>
        <CardDescription>ELA heatmap, metadata, watermark, and AI-based tamper signals.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="space-y-3">
            <Label>Upload Image</Label>
            <Input type="file" accept="image/*" onChange={onPick} />
            {file && (
              <div className="text-sm text-muted-foreground">{file.name} • {bytes(file.size)}</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" onClick={runELA} disabled={!src || processing} className="gap-2">
                <Activity className="h-4 w-4" /> Run ELA
              </Button>
              <Button variant="outline" onClick={extractMetadata} disabled={!file || processing} className="gap-2">
                <Info className="h-4 w-4" /> Read Metadata
              </Button>
              <Button variant="outline" onClick={checkWatermark} disabled={!file || processing} className="gap-2">
                <ScanSearch className="h-4 w-4" /> Check Watermark
              </Button>
              <Button onClick={aiForgeryAnalysis} disabled={!file || processing} className="gap-2">
                <Sparkles className="h-4 w-4" /> AI Forgery Analysis
              </Button>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div>
              <div className="text-sm text-muted-foreground mb-2">Original</div>
              <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                {src ? <img src={src} alt="original" className="w-full h-full object-contain" /> : <span className="text-xs text-muted-foreground">Upload an image</span>}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">ELA Heatmap</div>
                <div className="flex items-center gap-2 w-40">
                  <Label className="text-xs">Scale</Label>
                  <Slider value={elaScale} min={1} max={64} step={1} onValueChange={setElaScale} />
                </div>
              </div>
              <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                {elaUrl ? <img src={elaUrl} alt="ela heatmap" className="w-full h-full object-contain" /> : <span className="text-xs text-muted-foreground">Generate ELA to view heatmap</span>}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Metadata</CardTitle>
              <CardDescription>EXIF/XMP quick view</CardDescription>
            </CardHeader>
            <CardContent>
              {metadata ? (
                <div className="space-y-1 text-xs">
                  {Object.entries(metadata).slice(0, 20).map(([k,v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <span className="text-muted-foreground truncate max-w-[40%]">{k}</span>
                      <span className="font-mono truncate max-w-[55%]" title={String(v)}>{String(v)}</span>
                    </div>
                  ))}
                  {Object.keys(metadata).length > 20 && <div className="text-muted-foreground mt-2">…and more</div>}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No metadata extracted yet.</div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Watermark</CardTitle>
              <CardDescription>Invisible watermark detection</CardDescription>
            </CardHeader>
            <CardContent>
              {watermark ? (
                <div className="space-y-2">
                  <Badge variant={watermark.has ? 'default' : 'outline'}>
                    {watermark.has ? 'Detected' : 'Not Detected'}
                  </Badge>
                  <div className="text-sm">Confidence: {Math.round(watermark.confidence * 100)}%</div>
                  {watermark.id && <div className="text-xs text-muted-foreground">ID: {watermark.id}</div>}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Run watermark check.</div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">AI Assessment</CardTitle>
              <CardDescription>OpenAI vision based</CardDescription>
            </CardHeader>
            <CardContent>
              {aiResult ? (
                <div className="space-y-2">
                  <div className="text-sm">Forgery likelihood: <span className="font-medium">{aiResult.confidence ?? 50}%</span></div>
                  <div className="text-xs text-muted-foreground whitespace-pre-wrap">{aiResult.summary}</div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Run AI analysis to get a narrative assessment.</div>
              )}
            </CardContent>
          </Card>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
}

function ensureCanvas(ref?: React.RefObject<HTMLCanvasElement> | undefined, w?: number, h?: number) {
  const c = (ref && 'current' in ref && ref.current) ? ref.current : document.createElement('canvas');
  if (w && h) { c.width = w; c.height = h; }
  return c;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((res, rej) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

async function toBase64DataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
