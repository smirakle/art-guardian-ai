import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Shield, Download, CheckCircle, ChevronDown, FileImage, Loader2, Fingerprint, Lock } from 'lucide-react';
import { signC2PAManifest, embedC2PAManifest, isC2PASupportedType } from '@/lib/c2paValidation';
import { buildIngredient, ingredientToAssertion } from '@/lib/c2paIngredients';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SigningResult {
  signature: string;
  certificateFingerprint: string;
  algorithm: string;
  signingMode: 'production' | 'self-signed';
  manifestHash: string;
}

const C2PAProtection: React.FC = () => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'signing' | 'embedding' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [protectedBlob, setProtectedBlob] = useState<Blob | null>(null);
  const [signingResult, setSigningResult] = useState<SigningResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!isC2PASupportedType(selected.type)) {
      toast.error('Unsupported file type. Please upload a JPEG or PNG image.');
      return;
    }
    setFile(selected); setStatus('idle'); setProgress(0); setProtectedBlob(null); setSigningResult(null); setErrorMsg('');
  }, []);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (!dropped) return;
    if (!isC2PASupportedType(dropped.type)) { toast.error('Please upload a JPEG or PNG image.'); return; }
    setFile(dropped); setStatus('idle'); setProgress(0); setProtectedBlob(null); setSigningResult(null); setErrorMsg('');
  }, []);

  const handleProtect = useCallback(async () => {
    if (!file || !user) return;
    try {
      setStatus('signing'); setProgress(10);
      const fileBuffer = await file.arrayBuffer();
      const assetHashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer);
      const assetHashArray = new Uint8Array(assetHashBuffer);
      const assetHashHex = Array.from(assetHashArray).map(b => b.toString(16).padStart(2, '0')).join('');
      setProgress(20);
      const protectionId = crypto.randomUUID();
      const claim = {
        '@context': 'https://c2pa.org/specifications/specifications/2.2/specs/',
        claim_generator: 'TSMO/2.0 ai-protection-system',
        claim_generator_info: [{ name: 'TSMO AI Protection', version: '2.0' }],
        title: file.name,
        format: file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png',
        instance_id: `urn:c2pa:${protectionId}`,
        asset_hash: assetHashHex,
        assertions: [
          { label: 'c2pa.actions', data: { actions: [{ action: 'c2pa.created', digitalSourceType: 'http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia' }] } },
          { label: 'c2pa.hash.data', data: { exclusions: [{ start: 0, length: 0 }], name: 'jumbf manifest', alg: 'sha256', hash: assetHashHex } },
        ],
      };
      setProgress(30);
      const ingredient = await buildIngredient(file, 'parentOf');
      const ingredientAssertion = ingredientToAssertion(ingredient);
      claim.assertions.push({ label: 'c2pa.ingredient', data: ingredientAssertion.data as any });
      setProgress(40);
      const result = await signC2PAManifest(claim, protectionId, file.name);
      setSigningResult(result);
      setStatus('embedding'); setProgress(70);
      const manifestJson = JSON.stringify(claim);
      const ingredientsPayload = [{ label: 'c2pa.ingredient', data: ingredientAssertion.data }];
      const blob = await embedC2PAManifest(file, manifestJson, result.signature, ingredientsPayload);
      setProtectedBlob(blob); setProgress(100); setStatus('done');
      toast.success('Content Credentials applied successfully!');
    } catch (err: any) {
      console.error('[C2PAProtection] Error:', err);
      setErrorMsg(err.message || 'Failed to apply Content Credentials'); setStatus('error');
      toast.error('Failed to apply Content Credentials');
    }
  }, [file, user]);

  const handleDownload = useCallback(() => {
    if (!protectedBlob || !file) return;
    const url = URL.createObjectURL(protectedBlob);
    const a = document.createElement('a'); a.href = url;
    const ext = file.name.split('.').pop() || 'jpg';
    a.download = `${file.name.replace(/\.[^.]+$/, '')}_c2pa.${ext}`; a.click(); URL.revokeObjectURL(url);
  }, [protectedBlob, file]);

  const reset = () => { setFile(null); setStatus('idle'); setProgress(0); setProtectedBlob(null); setSigningResult(null); setErrorMsg(''); };

  return (
    <Card className="border bg-card/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
            <Fingerprint className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-base">Content Credentials (C2PA)</h3>
            <p className="text-xs text-muted-foreground">Tamper-evident provenance to prove authenticity</p>
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        {/* Drop Zone */}
        {!file && (
          <label
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer py-12 px-6 ${
              isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border hover:border-primary/40 hover:bg-muted/20'
            }`}
            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all ${isDragging ? 'bg-primary text-primary-foreground scale-110' : 'bg-muted text-muted-foreground'}`}>
              <FileImage className="h-7 w-7" />
            </div>
            <span className="text-sm font-medium mb-1">Drop an image or click to browse</span>
            <span className="text-xs text-muted-foreground">JPEG or PNG</span>
            <input type="file" accept="image/jpeg,image/png" onChange={handleFileSelect} className="hidden" />
          </label>
        )}

        {/* Selected File */}
        {file && status !== 'done' && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileImage className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs shrink-0" onClick={reset}>Change</Button>
          </div>
        )}

        {/* Progress */}
        {(status === 'signing' || status === 'embedding') && (
          <div className="space-y-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
            <Progress value={progress} className="h-1.5" />
            <p className="text-xs text-primary flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {status === 'signing' ? 'Signing manifest with ES256...' : 'Embedding credentials into image...'}
            </p>
          </div>
        )}

        {/* Action */}
        {file && status === 'idle' && (
          <Button className="w-full gap-2 h-11 shadow-lg shadow-primary/20" onClick={handleProtect} disabled={!user}>
            <Lock className="h-4 w-4" />
            Add Content Credentials
          </Button>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 space-y-3">
            <p className="text-sm text-destructive">{errorMsg}</p>
            <Button variant="outline" size="sm" className="w-full" onClick={reset}>Try Again</Button>
          </div>
        )}

        {/* Success */}
        {status === 'done' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
              <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Credentials Applied</p>
                <p className="text-xs text-muted-foreground">{file?.name}</p>
              </div>
            </div>

            <Button className="w-full gap-2 h-11 shadow-lg shadow-primary/20" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              Download Protected Image
            </Button>

            {signingResult && (
              <Collapsible open={showDetails} onOpenChange={setShowDetails}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground gap-1.5">
                    <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`} />
                    Technical Details
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 p-4 rounded-xl bg-muted/30 border text-xs space-y-2 font-mono">
                  {[
                    ['Algorithm', signingResult.algorithm],
                    ['Mode', signingResult.signingMode],
                    ['Manifest Hash', signingResult.manifestHash.substring(0, 32) + '…'],
                    ['Cert Fingerprint', signingResult.certificateFingerprint.substring(0, 32) + '…'],
                    ['Hash Bound', 'Yes (c2pa.hash.data)'],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between gap-4">
                      <span className="text-muted-foreground shrink-0">{label}</span>
                      <span className="truncate text-right">{val}</span>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            <Button variant="outline" size="sm" className="w-full" onClick={reset}>Protect Another Image</Button>
          </div>
        )}

        {!user && (
          <p className="text-xs text-muted-foreground text-center py-2">Sign in to add Content Credentials.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default C2PAProtection;
