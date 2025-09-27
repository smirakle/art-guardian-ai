import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, HelpCircle, Lightbulb, ArrowRight } from 'lucide-react';

interface TooltipConfig {
  id: string;
  selector: string;
  title: string;
  description: string;
  action?: {
    label: string;
    callback: () => void;
  };
  priority: number;
  showAfterDelay?: number;
  showOnce?: boolean;
}

const tooltipConfigs: TooltipConfig[] = [
  {
    id: 'upload-button',
    selector: '[data-tooltip="upload"]',
    title: 'Start Here!',
    description: 'Upload your first artwork to begin protecting it with AI technology.',
    action: {
      label: 'Upload Now',
      callback: () => window.location.href = '/upload'
    },
    priority: 1,
    showAfterDelay: 2000,
    showOnce: true
  },
  {
    id: 'ai-protection',
    selector: '[data-tooltip="ai-protection"]',
    title: 'AI Protection',
    description: 'Enable StyleCloak to prevent AI from learning your artistic style.',
    priority: 2,
    showAfterDelay: 5000,
    showOnce: true
  },
  {
    id: 'monitoring-dashboard',
    selector: '[data-tooltip="monitoring"]',
    title: 'Real-time Monitoring',
    description: 'Check this dashboard regularly to see if your art is being used without permission.',
    priority: 3,
    showAfterDelay: 3000
  },
  {
    id: 'protection-status',
    selector: '[data-tooltip="protection-status"]',
    title: 'Protection Status',
    description: 'Green means your art is fully protected. Yellow or red indicates action needed.',
    priority: 4,
    showAfterDelay: 4000
  }
];

interface ActiveTooltip extends TooltipConfig {
  position: { x: number; y: number };
  targetElement: Element;
}

const SmartTooltips: React.FC = () => {
  const [activeTooltip, setActiveTooltip] = useState<ActiveTooltip | null>(null);
  const [dismissedTooltips, setDismissedTooltips] = useState<string[]>([]);

  useEffect(() => {
    const dismissed = JSON.parse(localStorage.getItem('dismissed-tooltips') || '[]');
    setDismissedTooltips(dismissed);
  }, []);

  useEffect(() => {
    const checkForTooltips = () => {
      for (const config of tooltipConfigs.sort((a, b) => a.priority - b.priority)) {
        if (dismissedTooltips.includes(config.id)) continue;
        if (config.showOnce && dismissedTooltips.includes(config.id)) continue;

        const element = document.querySelector(config.selector);
        if (element) {
          const rect = element.getBoundingClientRect();
          const isVisible = rect.top >= 0 && rect.left >= 0 && 
                           rect.bottom <= window.innerHeight && 
                           rect.right <= window.innerWidth;

          if (isVisible) {
            setTimeout(() => {
              setActiveTooltip({
                ...config,
                position: {
                  x: rect.left + rect.width / 2,
                  y: rect.top - 10
                },
                targetElement: element
              });
            }, config.showAfterDelay || 0);
            break;
          }
        }
      }
    };

    const timer = setTimeout(checkForTooltips, 1000);
    return () => clearTimeout(timer);
  }, [dismissedTooltips]);

  const dismissTooltip = (tooltipId: string, permanent = false) => {
    setActiveTooltip(null);
    
    if (permanent) {
      const newDismissed = [...dismissedTooltips, tooltipId];
      setDismissedTooltips(newDismissed);
      localStorage.setItem('dismissed-tooltips', JSON.stringify(newDismissed));
    }
  };

  if (!activeTooltip) return null;

  const isNearTopOfScreen = activeTooltip.position.y < 200;
  const isNearRightOfScreen = activeTooltip.position.x > window.innerWidth - 200;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[90] pointer-events-none">
        <div 
          className="absolute border-2 border-primary rounded-lg"
          style={{
            left: activeTooltip.targetElement.getBoundingClientRect().left - 2,
            top: activeTooltip.targetElement.getBoundingClientRect().top - 2,
            width: activeTooltip.targetElement.getBoundingClientRect().width + 4,
            height: activeTooltip.targetElement.getBoundingClientRect().height + 4,
            animation: 'pulse 2s infinite'
          }}
        />
      </div>

      {/* Tooltip */}
      <Card
        className="fixed z-[100] w-80 shadow-xl border-2 border-primary/30 animate-fade-in"
        style={{
          left: isNearRightOfScreen 
            ? activeTooltip.position.x - 320 
            : activeTooltip.position.x - 160,
          top: isNearTopOfScreen 
            ? activeTooltip.position.y + 20 
            : activeTooltip.position.y - 120
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Lightbulb className="h-4 w-4 text-primary" />
              </div>
              <h4 className="font-semibold text-sm">{activeTooltip.title}</h4>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissTooltip(activeTooltip.id, true)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            {activeTooltip.description}
          </p>

          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissTooltip(activeTooltip.id)}
              className="text-xs"
            >
              Got it
            </Button>

            {activeTooltip.action && (
              <Button
                size="sm"
                onClick={() => {
                  activeTooltip.action!.callback();
                  dismissTooltip(activeTooltip.id, true);
                }}
                className="text-xs"
              >
                {activeTooltip.action.label}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>

          <div className="mt-3 pt-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissTooltip(activeTooltip.id, true)}
              className="text-xs text-muted-foreground w-full"
            >
              Don't show tips like this again
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default SmartTooltips;