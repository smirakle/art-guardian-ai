import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronRight, 
  Star, 
  Settings, 
  Zap,
  Eye,
  EyeOff 
} from 'lucide-react';

interface FeatureLevel {
  id: string;
  label: string;
  description: string;
  features: string[];
}

const featureLevels: FeatureLevel[] = [
  {
    id: 'simple',
    label: 'Simple Mode',
    description: 'Essential features for getting started quickly',
    features: ['Upload artwork', 'Basic protection', 'Simple monitoring']
  },
  {
    id: 'advanced',
    label: 'Advanced Mode',
    description: 'Full control over all protection features',
    features: ['Advanced AI settings', 'Custom monitoring rules', 'Detailed analytics', 'API access']
  },
  {
    id: 'expert',
    label: 'Expert Mode',
    description: 'Professional tools and enterprise features',
    features: ['Bulk operations', 'Team management', 'Custom integrations', 'White-label options']
  }
];

interface ProgressiveDisclosureProps {
  currentLevel?: 'simple' | 'advanced' | 'expert';
  onLevelChange?: (level: string) => void;
  children?: React.ReactNode;
}

const ProgressiveDisclosure: React.FC<ProgressiveDisclosureProps> = ({
  currentLevel = 'simple',
  onLevelChange,
  children
}) => {
  const [selectedLevel, setSelectedLevel] = useState(currentLevel);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [userExperience, setUserExperience] = useState<'beginner' | 'intermediate' | 'expert'>('beginner');

  useEffect(() => {
    // Determine user experience level based on usage patterns
    const storedLevel = localStorage.getItem('user-experience-level');
    if (storedLevel) {
      setUserExperience(storedLevel as any);
    }
  }, []);

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level as any);
    localStorage.setItem('user-interface-level', level);
    onLevelChange?.(level);
  };

  const toggleAdvancedOptions = () => {
    setShowAdvancedOptions(!showAdvancedOptions);
  };

  return (
    <div className="space-y-4">
      {/* Interface Level Selector */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Interface Level
              </CardTitle>
              <CardDescription>
                Choose your preferred level of detail and complexity
              </CardDescription>
            </div>
            <Badge variant="outline">
              {featureLevels.find(level => level.id === selectedLevel)?.label}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {featureLevels.map((level) => (
            <div
              key={level.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedLevel === level.id
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-primary/50'
              }`}
              onClick={() => handleLevelChange(level.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{level.label}</h4>
                  <p className="text-sm text-muted-foreground">{level.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedLevel === level.id && (
                    <Star className="h-4 w-4 text-primary" />
                  )}
                </div>
              </div>
              
              {selectedLevel === level.id && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex flex-wrap gap-1">
                    {level.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Advanced Options Toggle */}
      {selectedLevel !== 'simple' && (
        <Collapsible open={showAdvancedOptions} onOpenChange={setShowAdvancedOptions}>
          <Card className="border-orange-200">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-4 h-auto"
                onClick={toggleAdvancedOptions}
              >
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-orange-500" />
                  <div className="text-left">
                    <div className="font-medium">Advanced Options</div>
                    <div className="text-sm text-muted-foreground">
                      Fine-tune your experience
                    </div>
                  </div>
                </div>
                {showAdvancedOptions ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h5 className="font-medium">Display Options</h5>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Show All Features
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                        >
                          <EyeOff className="h-4 w-4 mr-2" />
                          Hide Beta Features
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="font-medium">Automation</h5>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Enable Smart Defaults
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Manual Configuration
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Content based on selected level */}
      {children}
    </div>
  );
};

export default ProgressiveDisclosure;