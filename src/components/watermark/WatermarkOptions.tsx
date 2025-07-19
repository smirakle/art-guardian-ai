import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { EnhancedWatermarkOptions } from '@/lib/enhancedWatermark';
import { Eye, EyeOff, Shield, Zap } from 'lucide-react';

interface WatermarkOptionsProps {
  options: EnhancedWatermarkOptions;
  onChange: (options: EnhancedWatermarkOptions) => void;
  onPreview?: () => void;
  disabled?: boolean;
}

export const WatermarkOptions: React.FC<WatermarkOptionsProps> = ({
  options,
  onChange,
  onPreview,
  disabled = false
}) => {
  const [activeTab, setActiveTab] = useState('basic');

  const updateOption = <K extends keyof EnhancedWatermarkOptions>(
    key: K,
    value: EnhancedWatermarkOptions[K]
  ) => {
    onChange({ ...options, [key]: value });
  };

  const getProtectionIcon = (level: string) => {
    switch (level) {
      case 'maximum': return <Shield className="w-4 h-4 text-red-500" />;
      case 'enhanced': return <Shield className="w-4 h-4 text-orange-500" />;
      case 'standard': return <Shield className="w-4 h-4 text-blue-500" />;
      default: return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'visible': return <Eye className="w-4 h-4" />;
      case 'invisible': return <EyeOff className="w-4 h-4" />;
      case 'hybrid': return <Zap className="w-4 h-4" />;
      default: return <EyeOff className="w-4 h-4" />;
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Enhanced Watermark Settings
          <Badge variant="outline" className="flex items-center gap-1">
            {getTypeIcon(options.type)}
            {options.type || 'invisible'}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            {getProtectionIcon(options.protectionLevel)}
            {options.protectionLevel || 'standard'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="visual">Visual</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="protection">Protection</TabsTrigger>
          </TabsList>

          {/* Basic Settings */}
          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="watermark-text">Watermark Text</Label>
              <Input
                id="watermark-text"
                value={options.text || ''}
                onChange={(e) => updateOption('text', e.target.value)}
                placeholder="Custom watermark text (optional)"
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label>Watermark Type</Label>
              <Select
                value={options.type || 'invisible'}
                onValueChange={(value: 'invisible' | 'visible' | 'hybrid') => updateOption('type', value)}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invisible">
                    <div className="flex items-center gap-2">
                      <EyeOff className="w-4 h-4" />
                      Invisible (Steganography)
                    </div>
                  </SelectItem>
                  <SelectItem value="visible">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Visible (Overlay)
                    </div>
                  </SelectItem>
                  <SelectItem value="hybrid">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Hybrid (Both)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Position</Label>
              <Select
                value={options.position || 'center'}
                onValueChange={(value) => updateOption('position', value as any)}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="top-left">Top Left</SelectItem>
                  <SelectItem value="top-right">Top Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  <SelectItem value="diagonal">Diagonal</SelectItem>
                  <SelectItem value="pattern">Pattern</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* Visual Settings */}
          <TabsContent value="visual" className="space-y-4">
            <div className="space-y-2">
              <Label>Opacity: {Math.round((options.opacity || 0.3) * 100)}%</Label>
              <Slider
                value={[(options.opacity || 0.3) * 100]}
                onValueChange={([value]) => updateOption('opacity', value / 100)}
                max={100}
                min={1}
                step={1}
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label>Size: {options.size || 16}px</Label>
              <Slider
                value={[options.size || 16]}
                onValueChange={([value]) => updateOption('size', value)}
                max={72}
                min={8}
                step={2}
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="watermark-color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="watermark-color"
                  type="color"
                  value={options.color || '#ffffff'}
                  onChange={(e) => updateOption('color', e.target.value)}
                  className="w-16 h-10 p-1"
                  disabled={disabled}
                />
                <Input
                  value={options.color || '#ffffff'}
                  onChange={(e) => updateOption('color', e.target.value)}
                  placeholder="#ffffff"
                  disabled={disabled}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Font</Label>
              <Select
                value={options.font || 'Arial'}
                onValueChange={(value) => updateOption('font', value)}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  <SelectItem value="Courier New">Courier New</SelectItem>
                  <SelectItem value="Verdana">Verdana</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Rotation: {options.rotation || 0}°</Label>
              <Slider
                value={[options.rotation || 0]}
                onValueChange={([value]) => updateOption('rotation', value)}
                max={360}
                min={-360}
                step={15}
                disabled={disabled}
              />
            </div>
          </TabsContent>

          {/* Advanced Settings */}
          <TabsContent value="advanced" className="space-y-4">
            <div className="space-y-2">
              <Label>Pattern</Label>
              <Select
                value={options.pattern || 'single'}
                onValueChange={(value) => updateOption('pattern', value as any)}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="tiled">Tiled</SelectItem>
                  <SelectItem value="spiral">Spiral</SelectItem>
                  <SelectItem value="cross">Cross</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Frequency (Invisible)</Label>
              <Select
                value={options.frequency || 'medium'}
                onValueChange={(value) => updateOption('frequency', value as any)}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (Less Detectable)</SelectItem>
                  <SelectItem value="medium">Medium (Balanced)</SelectItem>
                  <SelectItem value="high">High (More Robust)</SelectItem>
                  <SelectItem value="ultra">Ultra (Maximum Robustness)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Steganography Strength: {Math.round((options.steganographyStrength || 0.02) * 100)}%</Label>
              <Slider
                value={[(options.steganographyStrength || 0.02) * 100]}
                onValueChange={([value]) => updateOption('steganographyStrength', value / 100)}
                max={10}
                min={1}
                step={0.5}
                disabled={disabled}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="shadow"
                  checked={options.shadow || false}
                  onCheckedChange={(checked) => updateOption('shadow', checked)}
                  disabled={disabled}
                />
                <Label htmlFor="shadow">Add Shadow</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="border"
                  checked={options.border || false}
                  onCheckedChange={(checked) => updateOption('border', checked)}
                  disabled={disabled}
                />
                <Label htmlFor="border">Add Border</Label>
              </div>
            </div>
          </TabsContent>

          {/* Protection Settings */}
          <TabsContent value="protection" className="space-y-4">
            <div className="space-y-2">
              <Label>Protection Level</Label>
              <Select
                value={options.protectionLevel || 'standard'}
                onValueChange={(value) => updateOption('protectionLevel', value as any)}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-500" />
                      Basic (Fast, Light Protection)
                    </div>
                  </SelectItem>
                  <SelectItem value="standard">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-500" />
                      Standard (Balanced Protection)
                    </div>
                  </SelectItem>
                  <SelectItem value="enhanced">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-orange-500" />
                      Enhanced (Strong Protection)
                    </div>
                  </SelectItem>
                  <SelectItem value="maximum">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-500" />
                      Maximum (Military Grade)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <h4 className="font-medium">Protection Features:</h4>
              <ul className="text-sm space-y-1">
                <li>✓ Multi-layer watermarking</li>
                <li>✓ Frequency domain embedding</li>
                <li>✓ LSB steganography</li>
                <li>✓ Metadata signatures</li>
                <li>✓ Tampering detection</li>
                <li>✓ Degradation analysis</li>
              </ul>
            </div>

            <div className="space-y-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900">Recommended Settings:</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>For Photos:</strong> Hybrid type, Enhanced protection</p>
                <p><strong>For Artwork:</strong> Invisible type, Maximum protection</p>
                <p><strong>For Documents:</strong> Visible type, Standard protection</p>
                <p><strong>For Social Media:</strong> Visible type with low opacity</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {onPreview && (
          <div className="pt-4 border-t">
            <Button onClick={onPreview} variant="outline" className="w-full" disabled={disabled}>
              Preview Watermark
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};