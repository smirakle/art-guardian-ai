import React from 'react';
import UnifiedDashboard from './UnifiedDashboard';
import { BugReportButton } from '@/components/BugReportButton';
import { UserGuide } from '@/components/UserGuide';
import { dashboardGuide } from '@/data/userGuides';
import { MonitoringWrapper } from '@/components/MonitoringWrapper';

const Dashboard = () => {
  return (
    <MonitoringWrapper componentName="Dashboard" budgets={{ pageLoad: 1500, apiCall: 800 }}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Monitor and manage your protected content</p>
          </div>
          <UserGuide 
            title={dashboardGuide.title}
            description={dashboardGuide.description}
            sections={dashboardGuide.sections}
          />
        </div>
        <UnifiedDashboard />
        <BugReportButton />
      </div>
    </MonitoringWrapper>
  );
};

export default Dashboard;