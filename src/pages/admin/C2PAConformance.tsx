import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import CAIReadinessWidget from '@/components/admin/c2pa/CAIReadinessWidget';
import GeneratorEvidence from '@/components/admin/c2pa/GeneratorEvidence';
import ValidatorEvidence from '@/components/admin/c2pa/ValidatorEvidence';
import SecurityArchitecture from '@/components/admin/c2pa/SecurityArchitecture';
import TrustListViewer from '@/components/admin/c2pa/TrustListViewer';
import ConformanceExporter from '@/components/admin/c2pa/ConformanceExporter';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, X } from 'lucide-react';

const C2PAConformance: React.FC = () => {
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [credentialsMissing, setCredentialsMissing] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const { data } = await supabase.functions.invoke('c2pa-readiness-check');
        setCredentialsMissing(data?.status !== 'ok');
      } catch {
        setCredentialsMissing(true);
      }
    };
    check();
  }, []);

  return (
    <>
      <Helmet>
        <title>C2PA Conformance Evidence | TSMO Admin</title>
      </Helmet>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">C2PA Conformance Evidence</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Generate and export the deliverables required for C2PA Conformance Program submission.
          </p>
        </div>

        {credentialsMissing && !bannerDismissed && (
          <div className="flex items-start gap-3 rounded-md border border-amber-400 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="flex-1 space-y-1">
              <p className="font-semibold text-amber-800 dark:text-amber-300">
                Production credentials not configured — manifests are self-signed
              </p>
              <p className="text-amber-700 dark:text-amber-400">
                All manifests are currently signed with ephemeral keys and will be flagged as{' '}
                <strong>untrusted</strong> by C2PA validators. Conformance submission will fail.
                Add{' '}
                <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">C2PA_PRIVATE_KEY</code>,{' '}
                <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">C2PA_SIGNING_CERT</code>, and{' '}
                <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">C2PA_ISSUER_ID</code> to your{' '}
                <a
                  href="https://supabase.com/dashboard/project/_/settings/functions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  Supabase Edge Function secrets
                </a>
                {' '}to enable production signing.
              </p>
            </div>
            <button
              onClick={() => setBannerDismissed(true)}
              className="text-amber-600 dark:text-amber-400 hover:text-amber-800 shrink-0"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <CAIReadinessWidget />
        <TrustListViewer />
        <GeneratorEvidence />
        <ValidatorEvidence />
        <SecurityArchitecture />
        <ConformanceExporter />
      </div>
    </>
  );
};

export default C2PAConformance;
