import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, EyeOff, Mouse, Keyboard, Printer, GripHorizontal, ShieldCheck, ShieldAlert } from 'lucide-react';
import { ScreenshotShield } from './ScreenshotShield';
import type { ScreenshotProtectionConfig } from '@/hooks/useScreenshotProtection';

type Preset = 'light' | 'standard' | 'maximum';

const PRESETS: Record<Preset, ScreenshotProtectionConfig> = {
  light: {
    blockRightClick: true,
    blockKeyboardShortcuts: false,
    blurOnLeave: false,
    blockPrint: false,
    disableSelection: true,
    disableDrag: true,
  },
  standard: {
    blockRightClick: true,
    blockKeyboardShortcuts: true,
    blurOnLeave: true,
    blockPrint: true,
    disableSelection: true,
    disableDrag: true,
  },
  maximum: {
    blockRightClick: true,
    blockKeyboardShortcuts: true,
    blurOnLeave: true,
    blockPrint: true,
    disableSelection: true,
    disableDrag: true,
  },
};

export const ScreenshotProtectionSettings: React.FC = () => {
  const [activePreset, setActivePreset] = useState<Preset>('standard');
  const [config, setConfig] = useState<ScreenshotProtectionConfig>(PRESETS.standard);
  const [showWatermark, setShowWatermark] = useState(true);
  const [enabled, setEnabled] = useState(true);

  const applyPreset = (preset: Preset) => {
    setActivePreset(preset);
    setConfig(PRESETS[preset]);
    if (preset === 'maximum') setShowWatermark(true);
  };

  const updateConfig = (key: keyof ScreenshotProtectionConfig, value: boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setActivePreset('standard'); // Reset preset indicator on manual change
  };

  const toggles: { key: keyof ScreenshotProtectionConfig; label: string; description: string; icon: React.ReactNode }[] = [
    { key: 'blockRightClick', label: 'Block Right-Click', description: 'Prevents context menu on protected content', icon: <Mouse className="w-4 h-4" /> },
    { key: 'blockKeyboardShortcuts', label: 'Block Keyboard Shortcuts', description: 'Intercepts Ctrl+C, Ctrl+S, Ctrl+P, PrtScn', icon: <Keyboard className="w-4 h-4" /> },
    { key: 'blurOnLeave', label: 'Blur on Tab Leave', description: 'Hides content when browser loses focus', icon: <EyeOff className="w-4 h-4" /> },
    { key: 'blockPrint', label: 'Block Printing', description: 'Prevents print-to-PDF and browser print', icon: <Printer className="w-4 h-4" /> },
    { key: 'disableSelection', label: 'Disable Text Selection', description: 'Prevents selecting and copying text', icon: <GripHorizontal className="w-4 h-4" /> },
    { key: 'disableDrag', label: 'Disable Image Drag', description: 'Prevents dragging images to save them', icon: <GripHorizontal className="w-4 h-4" /> },
  ];

  const activeCount = Object.values(config).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Master Toggle & Presets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <div>
                <CardTitle className="text-lg">Screenshot Protection</CardTitle>
                <CardDescription>Multi-layered browser-based content protection</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={enabled ? 'default' : 'secondary'}>
                {enabled ? 'Active' : 'Disabled'}
              </Badge>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium text-muted-foreground mr-2">Presets:</span>
            {(['light', 'standard', 'maximum'] as Preset[]).map(preset => (
              <Button
                key={preset}
                variant={activePreset === preset ? 'default' : 'outline'}
                size="sm"
                onClick={() => applyPreset(preset)}
                className="capitalize"
              >
                {preset === 'light' && <Eye className="w-3 h-3 mr-1" />}
                {preset === 'standard' && <ShieldCheck className="w-3 h-3 mr-1" />}
                {preset === 'maximum' && <ShieldAlert className="w-3 h-3 mr-1" />}
                {preset}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {activeCount} of {toggles.length} protections active.
            Note: Browser-based protections deter casual copying but cannot prevent all capture methods.
          </p>
        </CardContent>
      </Card>

      {/* Individual Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Protection Layers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {toggles.map(({ key, label, description, icon }) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className="text-muted-foreground">{icon}</div>
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </div>
              <Switch
                checked={config[key]}
                onCheckedChange={(val) => updateConfig(key, val)}
                disabled={!enabled}
              />
            </div>
          ))}

          {/* Watermark toggle (separate from config) */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="text-muted-foreground"><Eye className="w-4 h-4" /></div>
              <div>
                <p className="text-sm font-medium">Invisible Watermark</p>
                <p className="text-xs text-muted-foreground">Traceable overlay embedded in screenshots</p>
              </div>
            </div>
            <Switch
              checked={showWatermark}
              onCheckedChange={setShowWatermark}
              disabled={!enabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Live Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Live Preview</CardTitle>
          <CardDescription>
            Try right-clicking, switching tabs, or using keyboard shortcuts below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScreenshotShield config={config} enabled={enabled} showWatermark={showWatermark} watermarkText="DEMO-USER">
            <div className="p-6 bg-muted/30 rounded-lg border border-border space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Protected Content Demo</h3>
              <p className="text-sm text-muted-foreground">
                This content is protected by the Screenshot Shield. Try to right-click, 
                select text, press Ctrl+C, or switch to another tab to see the protections in action.
              </p>
              <div className="flex gap-2">
                <Badge>Watermarked</Badge>
                <Badge variant="secondary">Copy Protected</Badge>
                <Badge variant="outline">Blur on Leave</Badge>
              </div>
              <div className="mt-4 p-4 bg-background rounded border border-border">
                <p className="text-xs font-mono text-muted-foreground">
                  Sample sensitive data: CONTRACT-2026-0314-ABCDEF
                </p>
              </div>
            </div>
          </ScreenshotShield>
        </CardContent>
      </Card>
    </div>
  );
};
