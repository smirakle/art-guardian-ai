import React, { useState } from 'react';
import { EmailMarketingAutomation } from '@/components/marketing/EmailMarketingAutomation';
import { EmailMarketingSetup } from '@/components/marketing/EmailMarketingSetup';
import { ProductionDeploymentChecklist } from '@/components/production/ProductionDeploymentChecklist';

const EmailMarketing = () => {
  const [activeTab, setActiveTab] = useState<'setup' | 'automation' | 'checklist'>('setup');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Production Readiness Center</h1>
            <p className="text-muted-foreground">
              Complete setup, email marketing, and deployment checklist
            </p>
          </div>
        </div>
        
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('setup')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'setup' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Email Setup
          </button>
          <button
            onClick={() => setActiveTab('automation')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'automation' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Automation
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'checklist' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Deployment Checklist
          </button>
        </div>

        {activeTab === 'setup' && <EmailMarketingSetup />}
        {activeTab === 'automation' && <EmailMarketingAutomation />}
        {activeTab === 'checklist' && <ProductionDeploymentChecklist />}
      </div>
    </div>
  );
};

export default EmailMarketing;