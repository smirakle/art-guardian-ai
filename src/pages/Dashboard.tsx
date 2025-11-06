import React from 'react';
import UnifiedDashboard from './UnifiedDashboard';
import { BugReportButton } from '@/components/BugReportButton';
import { HighThreatsSection } from '@/components/dashboard/HighThreatsSection';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Monitor and manage your protected content</p>
      </div>
      <HighThreatsSection />
      <UnifiedDashboard />
      <BugReportButton />
    </div>
  );
};

export default Dashboard;