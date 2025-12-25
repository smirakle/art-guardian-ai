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
  Lock
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const PROTECTION_METHODS = [
  { name: 'Glaze', status: 'active', description: 'Style cloaking technology' },
  { name: 'Nightshade', status: 'active', description: 'Adversarial protection' },
  { name: 'IPTC Metadata', status: 'active', description: 'Copyright embedding' },
  { name: 'C2PA', status: 'active', description: 'Content authenticity' },
  { name: 'Fingerprinting', status: 'active', description: 'Unique file signatures' },
];

const PROTECTION_FEATURES = [
  { feature: 'Style Cloaking', description: 'Adds invisible perturbations' },
  { feature: 'Metadata Injection', description: 'Embeds copyright info' },
  { feature: 'Crawler Blocking', description: 'Blocks AI scrapers' },
];

export const ProtectionDisclaimer = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <Alert className="border-primary/30 bg-primary/5">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            <AlertTitle className="text-sm font-medium mb-0">
              Protection Status: <Badge variant="default" className="ml-1 bg-green-600">ACTIVE</Badge>
            </AlertTitle>
            <div className="hidden sm:flex items-center gap-1 ml-2">
              {PROTECTION_METHODS.slice(0, 3).map((method) => (
                <Badge key={method.name} variant="secondary" className="text-xs">
                  {method.name}
                </Badge>
              ))}
              <Badge variant="outline" className="text-xs">+{PROTECTION_METHODS.length - 3}</Badge>
            </div>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2">
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              <span className="ml-1 text-xs">{isOpen ? 'Less' : 'Details'}</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent className="mt-4 space-y-4">
          {/* Protection Methods */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Active Protection Methods
            </h4>
            <div className="flex flex-wrap gap-2">
              {PROTECTION_METHODS.map((method) => (
                <Badge 
                  key={method.name} 
                  variant="outline" 
                  className="bg-background"
                  title={method.description}
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                  {method.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Protection Features */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              How Protection Works
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PROTECTION_FEATURES.map((item) => (
                <div key={item.feature} className="bg-muted/50 rounded-lg p-2 text-center">
                  <div className="text-sm font-medium">{item.feature}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Effectiveness Disclaimer */}
          <Alert variant="default" className="border-amber-500/30 bg-amber-500/5">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-xs">
              Protection methods are designed to deter AI training but cannot guarantee 100% prevention. 
              Effectiveness varies by AI model and scraping method. We recommend combining multiple protection layers.
            </AlertDescription>
          </Alert>
        </CollapsibleContent>
      </Alert>
    </Collapsible>
  );
};
