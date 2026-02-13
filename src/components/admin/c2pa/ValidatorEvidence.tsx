import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Download, FileSearch, Loader2, CheckCircle2, XCircle, ChevronDown, ChevronRight, Image as ImageIcon, Code2, Copy, Check } from 'lucide-react';
import { validateC2PAManifest, logC2PAValidation, C2PAValidationResult } from '@/lib/c2paValidation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ValidationEntry {
  fileName: string;
  fileSize: number;
  fileMimeType: string;
  result: C2PAValidationResult;
  validatedAt: string;
  thumbnailUrl?: string;
}

const ValidatorEvidence: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [entries, setEntries] = useState<ValidationEntry[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const createThumbnail = useCallback((file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(undefined);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setProcessing(true);
    setProgress(0);
    const newEntries: ValidationEntry[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress(Math.round(((i) / files.length) * 100));
      try {
        const [result, thumbnailUrl] = await Promise.all([
          validateC2PAManifest(file),
          createThumbnail(file),
        ]);
        newEntries.push({
          fileName: file.name,
          fileSize: file.size,
          fileMimeType: file.type,
          result,
          validatedAt: new Date().toISOString(),
          thumbnailUrl,
        });
        if (user?.id) {
          await logC2PAValidation(user.id, file.name, file.type, result.hasC2PA, {
            claimGenerator: result.claimGenerator,
            claimGeneratorInfo: result.claimGeneratorInfo,
            assertions: result.assertions,
            ingredients: result.ingredients,
            trustStatus: result.trustStatus,
            trustReason: result.trustReason,
            specVersion: result.specVersion,
            format: result.format,
            rawBoxCount: result.rawBoxCount,
            error: result.error,
          });
        }
      } catch (err: any) {
        const thumbnailUrl = await createThumbnail(file);
        newEntries.push({
          fileName: file.name,
          fileSize: file.size,
          fileMimeType: file.type,
          result: {
            hasC2PA: false,
            manifestFound: false,
            claimGenerator: null,
            assertions: [],
            ingredients: [],
            trustStatus: 'unknown' as const,
            format: 'unknown',
            rawBoxCount: 0,
            fileName: file.name,
            fileSize: file.size,
            fileMimeType: file.type,
            error: err.message,
          },
          validatedAt: new Date().toISOString(),
          thumbnailUrl,
        });
      }
    }

    setEntries(prev => [...prev, ...newEntries]);
    setProgress(100);
    setProcessing(false);

    const detected = newEntries.filter(e => e.result.hasC2PA).length;
    toast({ title: 'Validation complete', description: `${detected}/${newEntries.length} files have C2PA credentials.` });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const buildManifestJson = (entry: ValidationEntry) => ({
    file_name: entry.fileName,
    file_size_bytes: entry.fileSize,
    file_mime_type: entry.fileMimeType,
    validated_at: entry.validatedAt,
    has_c2pa: entry.result.hasC2PA,
    manifest_found: entry.result.manifestFound,
    claim_generator: entry.result.claimGenerator,
    claim_generator_info: entry.result.claimGeneratorInfo || null,
    assertions: entry.result.assertions,
    ingredients: entry.result.ingredients || [],
    trust_status: entry.result.trustStatus,
    trust_reason: entry.result.trustReason || null,
    spec_version: entry.result.specVersion || null,
    format: entry.result.format,
    raw_box_count: entry.result.rawBoxCount,
    error: entry.result.error || null,
  });

  const exportResults = () => {
    const report = {
      report_title: 'TSMO C2PA Validator Evidence – Conformant Image Library',
      spec_version: '2.2',
      product_name: 'TSMO AI Protection',
      product_class: 'Backend',
      product_roles: ['Generator', 'Validator'],
      generated_at: new Date().toISOString(),
      generator: 'TSMO/2.0 C2PA Conformance Tool',
      total_files: entries.length,
      files_with_c2pa: entries.filter(e => e.result.hasC2PA).length,
      files_without_c2pa: entries.filter(e => !e.result.hasC2PA).length,
      results: entries.map(buildManifestJson),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tsmo-validator-evidence-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyManifestJson = (index: number) => {
    const json = JSON.stringify(buildManifestJson(entries[index]), null, 2);
    navigator.clipboard.writeText(json);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadSingleJson = (entry: ValidationEntry) => {
    const json = JSON.stringify(buildManifestJson(entry), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entry.fileName.replace(/\.[^.]+$/, '')}-manifest.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><FileSearch className="h-5 w-5" />Validator Evidence</CardTitle>
        <CardDescription>Upload files from the C2PA Conformant Image Library to validate and export detection results.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input ref={fileInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime" className="hidden" onChange={handleFilesSelect} />
        <div className="flex gap-2">
          <Button onClick={() => fileInputRef.current?.click()} disabled={processing} className="gap-2">
            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {processing ? 'Validating…' : 'Upload Reference Files'}
          </Button>
          {entries.length > 0 && (
            <Button variant="outline" onClick={exportResults} className="gap-2">
              <Download className="h-4 w-4" /> Export All JSON
            </Button>
          )}
        </div>

        {processing && <Progress value={progress} className="h-2" />}

        {entries.length > 0 && (
          <>
            <div className="flex gap-2 text-sm">
              <Badge variant="default" className="bg-green-600">{entries.filter(e => e.result.hasC2PA).length} Detected</Badge>
              <Badge variant="outline">{entries.filter(e => !e.result.hasC2PA).length} Not Found</Badge>
              <Badge variant="secondary">{entries.length} Total</Badge>
            </div>

            <div className="space-y-2">
              {entries.map((entry, i) => {
                const isExpanded = expandedIndex === i;
                const manifestJson = JSON.stringify(buildManifestJson(entry), null, 2);

                return (
                  <div key={i} className="border rounded-lg overflow-hidden">
                    {/* Summary row */}
                    <button
                      onClick={() => setExpandedIndex(isExpanded ? null : i)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                    >
                      {/* Thumbnail */}
                      <div className="flex-shrink-0 w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                        {entry.thumbnailUrl ? (
                          <img src={entry.thumbnailUrl} alt={entry.fileName} className="w-10 h-10 object-cover rounded" />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>

                      {/* File info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-xs truncate">{entry.fileName}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {formatFileSize(entry.fileSize)} · {entry.result.format}
                          {entry.result.claimGenerator && ` · ${entry.result.claimGenerator}`}
                        </div>
                      </div>

                      {/* Status badges */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {entry.result.hasC2PA ? (
                          <Badge variant="default" className="bg-green-600 text-[10px] h-5">
                            <CheckCircle2 className="h-3 w-3 mr-1" />C2PA
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] h-5">
                            <XCircle className="h-3 w-3 mr-1" />No C2PA
                          </Badge>
                        )}
                        {entry.result.assertions.length > 0 && (
                          <Badge variant="secondary" className="text-[10px] h-5">
                            {entry.result.assertions.length} assertions
                          </Badge>
                        )}
                        {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </button>

                    {/* Expanded detail: image + JSON side by side */}
                    {isExpanded && (
                      <div className="border-t bg-muted/30 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Image preview */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                              <ImageIcon className="h-3.5 w-3.5" /> Image Preview
                            </div>
                            <div className="border rounded-lg bg-background p-2 flex items-center justify-center min-h-[200px]">
                              {entry.thumbnailUrl ? (
                                <img
                                  src={entry.thumbnailUrl}
                                  alt={entry.fileName}
                                  className="max-w-full max-h-[400px] rounded object-contain"
                                />
                              ) : (
                                <div className="text-muted-foreground text-sm flex flex-col items-center gap-2">
                                  <ImageIcon className="h-8 w-8" />
                                  <span>Preview not available for {entry.fileMimeType}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* JSON manifest */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                <Code2 className="h-3.5 w-3.5" /> Manifest JSON
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-[10px]"
                                  onClick={(e) => { e.stopPropagation(); copyManifestJson(i); }}
                                >
                                  {copiedIndex === i ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                                  {copiedIndex === i ? 'Copied' : 'Copy'}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-[10px]"
                                  onClick={(e) => { e.stopPropagation(); downloadSingleJson(entry); }}
                                >
                                  <Download className="h-3 w-3 mr-1" /> Download
                                </Button>
                              </div>
                            </div>
                            <ScrollArea className="border rounded-lg bg-background max-h-[400px]">
                              <pre className="p-3 text-[11px] font-mono leading-relaxed whitespace-pre-wrap break-all">
                                {manifestJson}
                              </pre>
                            </ScrollArea>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ValidatorEvidence;
