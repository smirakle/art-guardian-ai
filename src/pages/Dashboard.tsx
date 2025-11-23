import React from 'react';
import UnifiedDashboard from './UnifiedDashboard';
import SimpleDashboard from './SimpleDashboard';
import { BugReportButton } from '@/components/BugReportButton';
import { HighThreatsSection } from '@/components/dashboard/HighThreatsSection';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

const Dashboard = () => {
  const { interfaceMode } = useUserPreferences();

  if (interfaceMode === 'beginner') {
    return (
      <>
        <SimpleDashboard />
        <BugReportButton />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage your protected content</p>
        </div>
      </div>
      <HighThreatsSection />
      <UnifiedDashboard />
      <BugReportButton />
    </div>
  );
};

export default Dashboard;