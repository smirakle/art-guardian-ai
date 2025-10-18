import React from 'react';
import UnifiedDashboard from './UnifiedDashboard';
import { BugReportButton } from '@/components/BugReportButton';

const Dashboard = () => {
  return (
    <>
      <UnifiedDashboard />
      <BugReportButton />
    </>
  );
};

export default Dashboard;