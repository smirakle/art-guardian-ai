import React, { useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Upload, Download, Wand2, Shield, Eye, Sparkles } from 'lucide-react';
import { cloakImageFromFile } from '@/lib/styleCloak';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB limit for reliability
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const bytesToSize = (bytes: number) => {
  const sizes = ['Bytes', 'KB', 'MB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
};

const StyleCloak: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [strength, setStrength] = useState<number[]>([0.35]);
  const [frequency, setFrequency] = useState<number[]>([8]);
  const [colorJitter, setColorJitter] = useState<number[]>([0.1]);
  const [useSegmentation, setUseSegmentation] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);

  const canProcess = useMemo(() => !!file && !processing, [file, processing]);

  const onPick = () => inputRef.current?.click();

const onFile = (f?: File) => {
  const picked = f ?? inputRef.current?.files?.[0] ?? null;
  if (!picked) return;
  if (!ALLOWED_TYPES.includes(picked.type)) {
    toast.error('Unsupported format. Use JPEG, PNG, or WebP.');
    return;
  }
  if (picked.size > MAX_FILE_SIZE) {
    toast.error(`Image too large (${bytesToSize(picked.size)}). Max allowed is ${bytesToSize(MAX_FILE_SIZE)}.`);
    return;
  }
  setFile(picked);
  const url = URL.createObjectURL(picked);
  setPreviewUrl((old) => { if (old) URL.revokeObjectURL(old); return url; });
  setResultUrl((old) => { if (old) URL.revokeObjectURL(old); return null; });
};

const process = async () => {
  if (!file) return;
  try {
    setProcessing(true);

    // Optional rate limit check (non-blocking if RPC missing)
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (userId) {
        const { data: allowed } = await supabase.rpc('check_ai_protection_rate_limit', {
          user_id_param: userId,
          endpoint_param: 'style_cloak',
          max_requests_param: 200,
          window_minutes_param: 60,
        });
        if (allowed === false) {
          toast.error('Rate limit reached. Please try again later.');
          return;
        }
      }
    } catch (e) {
      console.warn('Rate limit check skipped', e);
    }

    toast.info('Applying Enhanced Style Cloaking...');
    const blob = await cloakImageFromFile(file, {
      strength: strength[0],
      frequency: frequency[0],
      colorJitter: colorJitter[0],
      useSegmentation,
    });
    const url = URL.createObjectURL(blob);
    setResultUrl((old) => { if (old) URL.revokeObjectURL(old); return url; });
    toast.success('Cloaking applied');
  } catch (e: any) {
    console.error(e);
    toast.error(e?.message ?? 'Failed to cloak image');
  } finally {
    setProcessing(false);
  }
};

const download = () => {
  if (!resultUrl || !file) return;
  const a = document.createElement('a');
  a.href = resultUrl;
  const base = file.name.replace(/\.[^.]+$/, '') || 'image';
  a.download = `${base}_cloaked.png`;
  a.click();
};

const saveToSupabase = async () => {
  try {
    if (!resultUrl) return;
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) {
      toast.error('Please sign in to save to your library.');
      return;
    }

    const res = await fetch(resultUrl);
    const blob = await res.blob();

    const base = (file?.name || 'image').replace(/\.[^.]+$/, '');
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const path = `${userId}/cloaked/${base}_${ts}.png`;

    const { error: upErr } = await supabase.storage
      .from('ai-protected-files')
      .upload(path, blob, { contentType: 'image/png', upsert: true });

    if (upErr) throw upErr;

    // Audit log (best-effort)
    try {
      await supabase.rpc('log_ai_protection_action', {
        user_id_param: userId,
        action_param: 'style_cloak_save',
        resource_type_param: 'image',
        resource_id_param: path,
        details_param: {
          original_filename: file?.name,
          strength: strength[0],
          frequency: frequency[0],
          color_jitter: colorJitter[0],
          use_segmentation: useSegmentation,
        },
      });
    } catch (e) {
      console.warn('Audit log failed', e);
    }

    toast.success('Saved to your protected files');
  } catch (e: any) {
    console.error(e);
    toast.error(e?.message ?? 'Failed to save image');
  }
};
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" /> Enhanced AI Style Cloaking
        </CardTitle>
        <CardDescription>
          Subtly alters your artwork to resist AI style learning while remaining visually indistinguishable to humans.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onPick} className="gap-2">
                <Upload className="h-4 w-4" /> Select image
              </Button>
              {file && (
                <div className="text-sm text-muted-foreground">
                  {file.name} • {bytesToSize(file.size)}
                </div>
              )}
              <input ref={inputRef} type="file" accept="image/*" onChange={() => onFile()} className="hidden" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label>Strength</Label>
                <Slider value={strength} min={0} max={1} step={0.01} onValueChange={setStrength} />
                <div className="text-xs text-muted-foreground mt-1">Higher values add stronger cloak (still subtle)</div>
              </div>
              <div>
                <Label>Frequency</Label>
                <Slider value={frequency} min={2} max={16} step={1} onValueChange={setFrequency} />
                <div className="text-xs text-muted-foreground mt-1">Spatial frequency of micro-texture</div>
              </div>
              <div>
                <Label>Color Jitter</Label>
                <Slider value={colorJitter} min={0} max={1} step={0.01} onValueChange={setColorJitter} />
                <div className="text-xs text-muted-foreground mt-1">Tiny color variation to disrupt embeddings</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch id="seg" checked={useSegmentation} onCheckedChange={setUseSegmentation} />
                <Label htmlFor="seg">Subject-aware cloaking (faster with WebGPU)</Label>
              </div>
              <Button onClick={process} disabled={!canProcess} className="gap-2">
                <Wand2 className="h-4 w-4" /> {processing ? 'Processing…' : 'Apply Cloak'}
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" /> Original
            </div>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                <img src={previewUrl} alt="original preview" className="w-full h-full object-contain" />
              ) : (
                <div className="text-sm text-muted-foreground">Select an image to preview</div>
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" /> Cloaked Preview
            </div>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              {resultUrl ? (
                <img src={resultUrl} alt="cloaked preview" className="w-full h-full object-contain" />
              ) : (
                <div className="text-sm text-muted-foreground">Run cloaking to see result</div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 flex justify-end gap-2">
            <Button variant="default" disabled={!resultUrl} onClick={saveToSupabase} className="gap-2">
              <Shield className="h-4 w-4" /> Save to Library
            </Button>
            <Button variant="secondary" disabled={!resultUrl} onClick={download} className="gap-2">
              <Download className="h-4 w-4" /> Download Cloaked Image
            </Button>
          </div>
          <div>
            {/** Resilience score card */}
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore - lazy import for bundle split not needed here */}
            {React.createElement(require('./StyleCloakResilience').default, {
              strength: strength[0],
              frequency: frequency[0],
              colorJitter: colorJitter[0],
              useSegmentation,
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StyleCloak;
