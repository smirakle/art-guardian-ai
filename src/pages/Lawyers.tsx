import React from 'react';
import IPLawyersDirectory from '@/components/IPLawyersDirectory';
import { BugReportButton } from '@/components/BugReportButton';

const Lawyers = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <IPLawyersDirectory />
      </div>
      <BugReportButton />
    </div>
  );
};

export default Lawyers;