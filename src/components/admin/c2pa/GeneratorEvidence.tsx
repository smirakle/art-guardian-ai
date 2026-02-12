import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, ShieldCheck, Loader2, FileJson, Image as ImageIcon } from 'lucide-react';
import { signC2PAManifest, embedC2PAManifest, C2PASigningResult } from '@/lib/c2paValidation';
import { useToast } from '@/hooks/use-toast';

interface GeneratorResult {
  manifest: Record<string, unknown>;
  signingResult: C2PASigningResult;
  protectedBlob: Blob | null;
  originalFile: File;
  protectionId: string;
  timestamp: string;
}

const GeneratorEvidence: React.FC = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<GeneratorResult | null>(null);

  const generateProtectionId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'TSMO-';
    for (let i = 0; i < 12; i++) id += chars[Math.floor(Math.random() * chars.length)];
    return id;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast({ title: 'Unsupported format', description: 'Only JPEG and PNG are supported for Generator evidence.', variant: 'destructive' });
      return;
    }

    setProcessing(true);
    setProgress(10);
    setResult(null);

    try {
      const protectionId = generateProtectionId();
      const timestamp = new Date().toISOString();

      // Build C2PA v2.2 manifest claim
      const claim: Record<string, unknown> = {
        '@context': 'https://c2pa.org/specifications/specifications/2.2/specs/',
        '@type': 'c2pa.claim',
        claim_generator: 'TSMO/2.0 ai-protection-system',
        claim_generator_info: [
          { name: 'TSMO AI Protection', version: '2.0' }
        ],
        title: `TSMO Protection – ${file.name}`,
        format: file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png',
        instance_id: `urn:c2pa:${crypto.randomUUID()}`,
        assertions: [
          { '@type': 'c2pa.actions', actions: [{ action: 'c2pa.created', when: timestamp, softwareAgent: 'TSMO AI Protection System v2.0' }] },
          { '@type': 'c2pa.creative.work', '@id': protectionId, copyrightNotice: `© ${new Date().getFullYear()} Content Owner. All rights reserved.` },
          { '@type': 'c2pa.rights', ai_training: { prohibited: true, derivatives_prohibited: true } },
        ],
      };

      setProgress(30);

      // Step 1: Sign
      const signingResult = await signC2PAManifest(claim, protectionId, file.name);
      setProgress(60);

      // Step 2: Embed JUMBF
      let protectedBlob: Blob | null = null;
      try {
        const manifestJson = JSON.stringify({ ...claim, claim_signature: { alg: 'ES256', sig: signingResult.signature } });
        protectedBlob = await embedC2PAManifest(file, manifestJson, signingResult.signature);
        setProgress(90);
      } catch (embedErr) {
        console.warn('JUMBF embedding returned error, continuing with manifest-only evidence:', embedErr);
      }

      const fullManifest = { ...claim, claim_signature: { alg: signingResult.algorithm, sig: signingResult.signature, certificate_fingerprint: signingResult.certificateFingerprint, signing_mode: signingResult.signingMode, manifest_hash: signingResult.manifestHash } };

      setResult({ manifest: fullManifest, signingResult, protectedBlob, originalFile: file, protectionId, timestamp });
      setProgress(100);
      toast({ title: 'Generator evidence created', description: `Signed with ${signingResult.algorithm} (${signingResult.signingMode})` });
    } catch (err: any) {
      toast({ title: 'Generation failed', description: err.message, variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const downloadJson = (data: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadEvidencePackage = () => {
    if (!result) return;
    // Download each file individually (no zip library needed)
    downloadJson(result.manifest, `c2pa-manifest-${result.protectionId}.json`);

    downloadJson({
      protectionId: result.protectionId,
      timestamp: result.timestamp,
      algorithm: result.signingResult.algorithm,
      signingMode: result.signingResult.signingMode,
      certificateFingerprint: result.signingResult.certificateFingerprint,
      manifestHash: result.signingResult.manifestHash,
      originalFileName: result.originalFile.name,
      originalFileSize: result.originalFile.size,
      originalFileMime: result.originalFile.type,
      protectedFileSize: result.protectedBlob?.size ?? null,
    }, `signing-summary-${result.protectionId}.json`);

    if (result.protectedBlob) {
      const ext = result.originalFile.type === 'image/png' ? 'png' : 'jpg';
      downloadBlob(result.protectedBlob, `protected-${result.protectionId}.${ext}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" />Generator Evidence</CardTitle>
        <CardDescription>Upload an image to generate a signed C2PA manifest and protected file with embedded JUMBF.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleFileSelect} />
        <Button onClick={() => fileInputRef.current?.click()} disabled={processing} className="gap-2">
          {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {processing ? 'Processing…' : 'Upload Image'}
        </Button>

        {processing && <Progress value={progress} className="h-2" />}

        {result && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="default" className="bg-green-600">Signed ({result.signingResult.signingMode})</Badge>
              <Badge variant="outline">{result.signingResult.algorithm}</Badge>
              {result.protectedBlob && <Badge variant="outline">JUMBF Embedded</Badge>}
            </div>

            {/* Manifest preview */}
            <details className="border rounded-md">
              <summary className="px-4 py-2 cursor-pointer text-sm font-medium flex items-center gap-2">
                <FileJson className="h-4 w-4" /> Signed Manifest JSON
              </summary>
              <pre className="p-4 text-xs overflow-auto max-h-80 bg-muted/30">{JSON.stringify(result.manifest, null, 2)}</pre>
            </details>

            {/* Signing details */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <div className="font-medium text-muted-foreground">Certificate Fingerprint</div>
                <code className="break-all">{result.signingResult.certificateFingerprint}</code>
              </div>
              <div className="space-y-1">
                <div className="font-medium text-muted-foreground">Manifest Hash</div>
                <code className="break-all">{result.signingResult.manifestHash}</code>
              </div>
              <div className="space-y-1">
                <div className="font-medium text-muted-foreground">Protection ID</div>
                <code>{result.protectionId}</code>
              </div>
              <div className="space-y-1">
                <div className="font-medium text-muted-foreground">Timestamp</div>
                <code>{result.timestamp}</code>
              </div>
            </div>

            {/* Downloads */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => downloadJson(result.manifest, `c2pa-manifest-${result.protectionId}.json`)} className="gap-1">
                <FileJson className="h-3 w-3" /> Manifest JSON
              </Button>
              {result.protectedBlob && (
                <Button variant="outline" size="sm" onClick={() => downloadBlob(result.protectedBlob!, `protected-${result.protectionId}.${result.originalFile.type === 'image/png' ? 'png' : 'jpg'}`)} className="gap-1">
                  <ImageIcon className="h-3 w-3" /> Protected Image
                </Button>
              )}
              <Button size="sm" onClick={downloadEvidencePackage} className="gap-1">
                <Download className="h-3 w-3" /> Download Evidence Package
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GeneratorEvidence;
