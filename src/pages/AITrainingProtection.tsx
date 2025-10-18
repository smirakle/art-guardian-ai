import React from 'react';
import AITrainingProtectionDashboard from '@/components/ai-protection/AITrainingProtectionDashboard';
import { BugReportButton } from '@/components/BugReportButton';

const AITrainingProtection = () => {
  return (
    <div className="min-h-screen pt-32 pb-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <AITrainingProtectionDashboard />
      </div>
      <BugReportButton />
    </div>
  );
};

export default AITrainingProtection;