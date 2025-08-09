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
    if (!picked.type.startsWith('image/')) {
      toast.error('Please select an image file');
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

        <div className="flex justify-end">
          <Button variant="secondary" disabled={!resultUrl} onClick={download} className="gap-2">
            <Download className="h-4 w-4" /> Download Cloaked Image
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StyleCloak;
