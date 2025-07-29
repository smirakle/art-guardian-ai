import React from 'react';
import { AITrainingSettings } from '@/components/AITrainingSettings';

const AIProtectionSettings = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Training Protection Settings</h1>
          <p className="text-muted-foreground">
            Configure how your content is protected from unauthorized AI training and machine learning use.
          </p>
        </div>
        
        <AITrainingSettings />
      </div>
    </div>
  );
};

export default AIProtectionSettings;