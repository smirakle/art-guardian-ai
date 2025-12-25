import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle,
  Zap,
  Info,
  Globe,
  ExternalLink,
  Settings2
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';

const API_SERVICES = [
  { name: 'SerpAPI', status: 'active', description: 'Reverse image search' },
  { name: 'OpenAI Vision', status: 'active', description: 'AI content analysis' },
  { name: 'TinEye', status: 'active', description: 'Image matching' },
  { name: 'Google Vision', status: 'active', description: 'Visual detection' },
  { name: 'Tesseract.js', status: 'active', description: 'OCR processing' },
];

const DAILY_LIMITS = [
  { service: 'Full Scan', limit: 50 },
  { service: 'Monitoring', limit: 100 },
  { service: 'AI Analysis', limit: 25 },
];

export const MonitoringDisclaimer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const { isAdmin } = useUserPreferences();

  const shouldShowDiagnostics = isAdmin || showDiagnostics;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <Alert className="border-primary/30 bg-primary/5">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <AlertTitle className="text-sm font-medium mb-0">
              Production Status: <Badge variant="default" className="ml-1 bg-green-600">LIVE</Badge>
            </AlertTitle>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2">
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              <span className="ml-1 text-xs">{isOpen ? 'Less' : 'Details'}</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent className="mt-4 space-y-4">
          {/* Coverage Info for Regular Users */}
          {!shouldShowDiagnostics && (
            <div className="bg-background/50 rounded-lg p-4 border border-border/50">
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-foreground">
                    <strong>Monitoring coverage:</strong> web + marketplaces + repost sources (varies by plan).
                  </p>
                  <Link 
                    to="/faq" 
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
                  >
                    Learn what we monitor
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Diagnostics - Only for Admin or when toggled */}
          {shouldShowDiagnostics && (
            <Collapsible defaultOpen={isAdmin}>
              <div className="border border-border/50 rounded-lg">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-3 h-auto">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Settings2 className="h-4 w-4 text-muted-foreground" />
                      Advanced Diagnostics
                      {isAdmin && <Badge variant="secondary" className="text-xs">Admin</Badge>}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-3 pb-3 space-y-4">
                  {/* Active APIs */}
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      Active API Services
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {API_SERVICES.map((api) => (
                        <Badge 
                          key={api.name} 
                          variant="outline" 
                          className="bg-background"
                          title={api.description}
                        >
                          <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                          {api.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Daily Limits */}
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      Daily API Limits
                    </h4>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {DAILY_LIMITS.map((item) => (
                        <div key={item.service} className="bg-muted/50 rounded-lg p-2">
                          <div className="text-lg font-bold">{item.limit}</div>
                          <div className="text-xs text-muted-foreground">{item.service}</div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Limits reset at midnight UTC
                    </p>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          )}

          {/* Show Diagnostics Toggle - Only for non-admins */}
          {!isAdmin && (
            <div className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg">
              <Label htmlFor="show-diagnostics" className="text-xs text-muted-foreground cursor-pointer">
                Show diagnostics
              </Label>
              <Switch
                id="show-diagnostics"
                checked={showDiagnostics}
                onCheckedChange={setShowDiagnostics}
                className="scale-75"
              />
            </div>
          )}

          {/* Accuracy Disclaimer */}
          <Alert variant="default" className="border-amber-500/30 bg-amber-500/5">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-xs">
              AI detection results should be verified by experts. While our systems achieve high accuracy, 
              no automated detection is 100% reliable. Use results as guidance, not definitive proof.
            </AlertDescription>
          </Alert>
        </CollapsibleContent>
      </Alert>
    </Collapsible>
  );
};
