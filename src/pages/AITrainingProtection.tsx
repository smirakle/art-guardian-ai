import React, { useState } from 'react';
import AITrainingProtectionDashboard from '@/components/ai-protection/AITrainingProtectionDashboard';
import { BugReportButton } from '@/components/BugReportButton';
import { AITPSetupBanner } from '@/components/ai-protection/AITPSetupBanner';
import { ScreenshotShield } from '@/components/protection/ScreenshotShield';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const AITrainingProtection = () => {
  const { user } = useAuth();
  const [shieldEnabled, setShieldEnabled] = useState(true);

  const watermarkText = user?.email || user?.id || 'PROTECTED';

  return (
    <div className="min-h-screen pt-32 pb-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-end mb-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={shieldEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShieldEnabled(!shieldEnabled)}
                  className="gap-2"
                >
                  {shieldEnabled ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                  {shieldEnabled ? 'Shield Active' : 'Shield Off'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{shieldEnabled ? 'Disable screenshot protection' : 'Enable screenshot protection'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <ScreenshotShield
          watermarkText={watermarkText}
          enabled={shieldEnabled}
          showWatermark={shieldEnabled}
        >
          <AITPSetupBanner />
          <AITrainingProtectionDashboard />
        </ScreenshotShield>
      </div>
      <BugReportButton />
    </div>
  );
};

export default AITrainingProtection;
