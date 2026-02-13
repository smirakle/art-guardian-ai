import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Package, FileJson, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const ConformanceExporter: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [counts, setCounts] = useState<{ signing: number; validation: number } | null>(null);

  const fetchCounts = async () => {
    const [signing, validation] = await Promise.all([
      supabase.from('c2pa_signing_logs' as any).select('id', { count: 'exact', head: true }),
      supabase.from('c2pa_validation_logs' as any).select('id', { count: 'exact', head: true }),
    ]);
    setCounts({
      signing: signing.count ?? 0,
      validation: validation.count ?? 0,
    });
  };

  React.useEffect(() => { fetchCounts(); }, []);

  const buildGeneratorManifests = async () => {
    const { data, error } = await supabase
      .from('c2pa_signing_logs' as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return {
      report_title: 'TSMO C2PA Generator Manifests',
      spec_version: '2.2',
      product_name: 'TSMO AI Protection',
      product_class: 'Backend',
      assurance_level: 'Level 1',
      generated_at: new Date().toISOString(),
      total_manifests: (data || []).length,
      manifests: (data || []).map((r: any) => ({
        id: r.id,
        file_name: r.file_name,
        protection_id: r.protection_id,
        signing_algorithm: r.signing_algorithm,
        signing_mode: r.signing_mode,
        certificate_fingerprint: r.certificate_fingerprint,
        manifest_hash: r.manifest_hash,
        created_at: r.created_at,
        metadata: r.metadata,
      })),
    };
  };

  const buildValidatorResults = async () => {
    const { data, error } = await supabase
      .from('c2pa_validation_logs' as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return {
      report_title: 'TSMO C2PA Validator Results – Ingredient Samples',
      spec_version: '2.2',
      product_name: 'TSMO AI Protection',
      product_class: 'Backend',
      generated_at: new Date().toISOString(),
      total_files: (data || []).length,
      files_with_c2pa: (data || []).filter((r: any) => r.has_c2pa).length,
      files_without_c2pa: (data || []).filter((r: any) => !r.has_c2pa).length,
      results: (data || []).map((r: any) => ({
        id: r.id,
        file_name: r.file_name,
        file_type: r.file_type,
        has_c2pa: r.has_c2pa,
        validated_at: r.created_at,
        manifest_data: r.manifest_data,
      })),
    };
  };

  const buildCoverSheet = () => ({
    product_information: {
      common_name: 'TSMO AI Protection',
      organization: 'TSMO Technology Inc.',
      country: 'US',
      assurance_level: 'Level 1',
      product_class: 'Backend',
      product_roles: ['Generator', 'Validator'],
      spec_version: 'C2PA v2.2',
      signing_algorithm: 'ES256 (ECDSA P-256)',
      signing_mode: 'Software-based',
      supported_media_types: {
        generator: ['image/jpeg', 'image/png'],
        validator: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'],
      },
    },
    submission_date: new Date().toISOString(),
    package_contents: [
      'conformance-summary.json (this file)',
      'generator-manifests.json',
      'validator-results.json',
    ],
  });

  const handleExportGeneratorManifests = async () => {
    setLoading('generator');
    try {
      const data = await buildGeneratorManifests();
      downloadJson(data, `generator-manifests-${new Date().toISOString().slice(0, 10)}.json`);
      toast({ title: 'Exported', description: `${data.total_manifests} generator manifests downloaded.` });
    } catch (err: any) {
      toast({ title: 'Export failed', description: err.message, variant: 'destructive' });
    }
    setLoading(null);
  };

  const handleExportValidatorResults = async () => {
    setLoading('validator');
    try {
      const data = await buildValidatorResults();
      if (data.total_files === 0) {
        toast({ title: 'No results', description: 'No validation results found. Use the Validator Evidence tool above to scan files first.', variant: 'destructive' });
        setLoading(null);
        return;
      }
      downloadJson(data, `validator-results-${new Date().toISOString().slice(0, 10)}.json`);
      toast({ title: 'Exported', description: `${data.total_files} validation results downloaded.` });
    } catch (err: any) {
      toast({ title: 'Export failed', description: err.message, variant: 'destructive' });
    }
    setLoading(null);
  };

  const handleExportFullPackage = async () => {
    setLoading('full');
    try {
      const [generatorData, validatorData] = await Promise.all([
        buildGeneratorManifests(),
        buildValidatorResults(),
      ]);
      const coverSheet = buildCoverSheet();

      // Download sequentially with small delays for browser
      downloadJson(coverSheet, `conformance-summary-${new Date().toISOString().slice(0, 10)}.json`);
      await new Promise(r => setTimeout(r, 300));
      downloadJson(generatorData, `generator-manifests-${new Date().toISOString().slice(0, 10)}.json`);
      await new Promise(r => setTimeout(r, 300));
      if (validatorData.total_files > 0) {
        downloadJson(validatorData, `validator-results-${new Date().toISOString().slice(0, 10)}.json`);
      }

      toast({
        title: 'Full package exported',
        description: `Cover sheet + ${generatorData.total_manifests} manifests + ${validatorData.total_files} validation results.`,
      });
    } catch (err: any) {
      toast({ title: 'Export failed', description: err.message, variant: 'destructive' });
    }
    setLoading(null);
    fetchCounts();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Conformance Evidence Exporter
        </CardTitle>
        <CardDescription>
          Export your generator manifests and validator results as JSON files for C2PA Conformance Program submission.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {counts && (
          <div className="flex gap-2 text-sm">
            <Badge variant="secondary">{counts.signing} Generator Manifests</Badge>
            <Badge variant="secondary">{counts.validation} Validation Results</Badge>
          </div>
        )}

        {counts && counts.validation === 0 && (
          <div className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 p-3 rounded-md">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>No validation results saved yet. Use the <strong>Validator Evidence</strong> tool above to scan C2PA ingredient samples — results will be automatically saved for export.</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleExportGeneratorManifests} disabled={!!loading} className="gap-2">
            {loading === 'generator' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileJson className="h-4 w-4" />}
            Export Generator Manifests
          </Button>
          <Button variant="outline" onClick={handleExportValidatorResults} disabled={!!loading} className="gap-2">
            {loading === 'validator' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileJson className="h-4 w-4" />}
            Export Validator Results
          </Button>
          <Button onClick={handleExportFullPackage} disabled={!!loading} className="gap-2">
            {loading === 'full' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export Full Submission Package
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConformanceExporter;
