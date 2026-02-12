import React from 'react';
import { Helmet } from 'react-helmet';
import GeneratorEvidence from '@/components/admin/c2pa/GeneratorEvidence';
import ValidatorEvidence from '@/components/admin/c2pa/ValidatorEvidence';
import SecurityArchitecture from '@/components/admin/c2pa/SecurityArchitecture';
import TrustListViewer from '@/components/admin/c2pa/TrustListViewer';

const C2PAConformance: React.FC = () => {
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

        <TrustListViewer />
        <GeneratorEvidence />
        <ValidatorEvidence />
        <SecurityArchitecture />
      </div>
    </>
  );
};

export default C2PAConformance;
