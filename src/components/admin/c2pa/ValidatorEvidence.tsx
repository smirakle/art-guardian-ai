import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Download, FileSearch, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { validateC2PAManifest, C2PAValidationResult } from '@/lib/c2paValidation';
import { useToast } from '@/hooks/use-toast';

interface ValidationEntry {
  fileName: string;
  fileSize: number;
  fileMimeType: string;
  result: C2PAValidationResult;
  validatedAt: string;
}

const ValidatorEvidence: React.FC = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [entries, setEntries] = useState<ValidationEntry[]>([]);

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
        const result = await validateC2PAManifest(file);
        newEntries.push({
          fileName: file.name,
          fileSize: file.size,
          fileMimeType: file.type,
          result,
          validatedAt: new Date().toISOString(),
        });
      } catch (err: any) {
        newEntries.push({
          fileName: file.name,
          fileSize: file.size,
          fileMimeType: file.type,
          result: {
            hasC2PA: false,
            manifestFound: false,
            claimGenerator: null,
            assertions: [],
            format: 'unknown',
            rawBoxCount: 0,
            fileName: file.name,
            fileSize: file.size,
            fileMimeType: file.type,
            error: err.message,
          },
          validatedAt: new Date().toISOString(),
        });
      }
    }

    setEntries(prev => [...prev, ...newEntries]);
    setProgress(100);
    setProcessing(false);

    const detected = newEntries.filter(e => e.result.hasC2PA).length;
    toast({ title: 'Validation complete', description: `${detected}/${newEntries.length} files have C2PA credentials.` });

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const exportResults = () => {
    const report = {
      report_title: 'TSMO C2PA Validator Evidence – Conformant Image Library',
      generated_at: new Date().toISOString(),
      generator: 'TSMO/2.0 C2PA Conformance Tool',
      total_files: entries.length,
      files_with_c2pa: entries.filter(e => e.result.hasC2PA).length,
      files_without_c2pa: entries.filter(e => !e.result.hasC2PA).length,
      results: entries.map(e => ({
        file_name: e.fileName,
        file_size_bytes: e.fileSize,
        file_mime_type: e.fileMimeType,
        validated_at: e.validatedAt,
        has_c2pa: e.result.hasC2PA,
        manifest_found: e.result.manifestFound,
        claim_generator: e.result.claimGenerator,
        assertions: e.result.assertions,
        format: e.result.format,
        raw_box_count: e.result.rawBoxCount,
        error: e.result.error || null,
      })),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tsmo-validator-evidence-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
              <Download className="h-4 w-4" /> Export Results JSON
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

            <div className="border rounded-md overflow-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>C2PA</TableHead>
                    <TableHead>Claim Generator</TableHead>
                    <TableHead>Assertions</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Boxes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-xs max-w-[200px] truncate" title={entry.fileName}>{entry.fileName}</TableCell>
                      <TableCell>
                        {entry.result.hasC2PA ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="text-xs">{entry.result.claimGenerator || '—'}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {entry.result.assertions.length > 0
                            ? entry.result.assertions.map((a, j) => <Badge key={j} variant="outline" className="text-[10px] h-5">{a}</Badge>)
                            : <span className="text-xs text-muted-foreground">—</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{entry.result.format}</TableCell>
                      <TableCell className="text-xs">{entry.result.rawBoxCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ValidatorEvidence;
