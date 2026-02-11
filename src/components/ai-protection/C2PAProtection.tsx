import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Shield, Upload, Download, CheckCircle, ChevronDown, FileImage, Loader2 } from 'lucide-react';
import { signC2PAManifest, embedC2PAManifest, isC2PASupportedType } from '@/lib/c2paValidation';
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

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!isC2PASupportedType(selected.type)) {
      toast.error('Unsupported file type. Please upload a JPEG or PNG image.');
      return;
    }

    setFile(selected);
    setStatus('idle');
    setProgress(0);
    setProtectedBlob(null);
    setSigningResult(null);
    setErrorMsg('');
  }, []);

  const handleProtect = useCallback(async () => {
    if (!file || !user) return;

    try {
      setStatus('signing');
      setProgress(20);

      const protectionId = crypto.randomUUID();
      const claim = {
        claim_generator: 'TSMO/2.0',
        title: file.name,
        format: file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png',
        instance_id: protectionId,
        assertions: [
          {
            label: 'c2pa.actions',
            data: { actions: [{ action: 'c2pa.created', digitalSourceType: 'http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia' }] },
          },
          {
            label: 'c2pa.hash.data',
            data: { exclusions: [], name: 'jumbf manifest', alg: 'sha256' },
          },
        ],
      };

      setProgress(40);
      const result = await signC2PAManifest(claim, protectionId, file.name);
      setSigningResult(result);

      setStatus('embedding');
      setProgress(70);

      const manifestJson = JSON.stringify(claim);
      const blob = await embedC2PAManifest(file, manifestJson, result.signature);

      setProtectedBlob(blob);
      setProgress(100);
      setStatus('done');
      toast.success('Content Credentials applied successfully!');
    } catch (err: any) {
      console.error('[C2PAProtection] Error:', err);
      setErrorMsg(err.message || 'Failed to apply Content Credentials');
      setStatus('error');
      toast.error('Failed to apply Content Credentials');
    }
  }, [file, user]);

  const handleDownload = useCallback(() => {
    if (!protectedBlob || !file) return;
    const url = URL.createObjectURL(protectedBlob);
    const a = document.createElement('a');
    a.href = url;
    const ext = file.name.split('.').pop() || 'jpg';
    a.download = `${file.name.replace(/\.[^.]+$/, '')}_c2pa.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [protectedBlob, file]);

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setProgress(0);
    setProtectedBlob(null);
    setSigningResult(null);
    setErrorMsg('');
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Add tamper-evident Content Credentials (C2PA) to prove your work is authentic and you are the creator.
      </p>

      {/* File Selection */}
      {!file && (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 cursor-pointer hover:border-primary/50 transition-colors">
          <FileImage className="h-10 w-10 text-muted-foreground mb-2" />
          <span className="text-sm font-medium">Drop an image here or click to browse</span>
          <span className="text-xs text-muted-foreground mt-1">JPEG or PNG</span>
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      )}

      {/* Selected File */}
      {file && status !== 'done' && (
        <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
          <FileImage className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <Button variant="ghost" size="sm" onClick={reset}>Change</Button>
        </div>
      )}

      {/* Progress */}
      {(status === 'signing' || status === 'embedding') && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            {status === 'signing' ? 'Signing manifest with ES256...' : 'Embedding credentials into image...'}
          </p>
        </div>
      )}

      {/* Action Button */}
      {file && status === 'idle' && (
        <Button className="w-full" onClick={handleProtect} disabled={!user}>
          <Shield className="h-4 w-4 mr-2" />
          Add Content Credentials
        </Button>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {errorMsg}
          <Button variant="outline" size="sm" className="mt-2 w-full" onClick={reset}>Try Again</Button>
        </div>
      )}

      {/* Success */}
      {status === 'done' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-500/10 p-3 rounded-md">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>Content Credentials applied to <strong>{file?.name}</strong></span>
          </div>

          <Button className="w-full" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download Protected Image
          </Button>

          {/* Technical Details */}
          {signingResult && (
            <Collapsible open={showDetails} onOpenChange={setShowDetails}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground">
                  <ChevronDown className={`h-3 w-3 mr-1 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
                  Technical Details
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 p-3 rounded-md bg-muted/50 text-xs space-y-1 font-mono">
                <p><span className="text-muted-foreground">Algorithm:</span> {signingResult.algorithm}</p>
                <p><span className="text-muted-foreground">Mode:</span> {signingResult.signingMode}</p>
                <p><span className="text-muted-foreground">Manifest Hash:</span> {signingResult.manifestHash.substring(0, 32)}…</p>
                <p><span className="text-muted-foreground">Cert Fingerprint:</span> {signingResult.certificateFingerprint.substring(0, 32)}…</p>
              </CollapsibleContent>
            </Collapsible>
          )}

          <Button variant="outline" size="sm" className="w-full" onClick={reset}>
            Protect Another Image
          </Button>
        </div>
      )}

      {!user && (
        <p className="text-xs text-muted-foreground text-center">Sign in to add Content Credentials to your images.</p>
      )}
    </div>
  );
};

export default C2PAProtection;
