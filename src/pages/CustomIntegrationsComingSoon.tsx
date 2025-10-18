import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Clock } from 'lucide-react';
import { BugReportButton } from '@/components/BugReportButton';

const CustomIntegrationsComingSoon = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Settings className="w-16 h-16 text-primary" />
              <Clock className="w-6 h-6 text-muted-foreground absolute -bottom-1 -right-1 bg-background rounded-full p-1" />
            </div>
          </div>
          <CardTitle className="text-2xl">Custom Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-lg mb-4">
            Coming Soon
          </p>
          <p className="text-sm text-muted-foreground">
            We're working on bringing you powerful custom integration capabilities. Stay tuned!
          </p>
        </CardContent>
      </Card>
      <BugReportButton />
    </div>
  );
};

export default CustomIntegrationsComingSoon;