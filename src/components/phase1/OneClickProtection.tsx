import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Shield, Zap, FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProtectionOption {
  id: string;
  label: string;
  description: string;
  platforms: string[];
  estimatedTime: string;
  successRate: number;
}

const PROTECTION_OPTIONS: ProtectionOption[] = [
  {
    id: 'dmca_takedown',
    label: 'DMCA Takedown Notice',
    description: 'Send automated DMCA takedown notices to platforms',
    platforms: ['Google', 'Social Media', 'Image Hosting'],
    estimatedTime: '24-48 hours',
    successRate: 85
  },
  {
    id: 'cease_desist',
    label: 'Cease & Desist Letter',
    description: 'Legal demand letter for immediate action',
    platforms: ['Direct Contact', 'Legal Notice'],
    estimatedTime: '1-3 days',
    successRate: 70
  },
  {
    id: 'platform_report',
    label: 'Platform Copyright Report',
    description: 'Native platform reporting tools',
    platforms: ['Instagram', 'Facebook', 'Twitter', 'TikTok'],
    estimatedTime: '2-7 days',
    successRate: 75
  },
  {
    id: 'legal_escalation',
    label: 'Legal Escalation',
    description: 'Formal legal action preparation',
    platforms: ['Court System', 'Legal Network'],
    estimatedTime: '1-2 weeks',
    successRate: 95
  }
];

interface InfringementCase {
  id: string;
  imageUrl: string;
  platforms: string[];
  infringingUrls: string[];
  description: string;
}

export function OneClickProtection() {
  const [selectedCase, setSelectedCase] = useState<InfringementCase | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Sample infringement cases (in real app, this would come from detection results)
  const [cases] = useState<InfringementCase[]>([
    {
      id: '1',
      imageUrl: '/placeholder.svg',
      platforms: ['Instagram', 'Pinterest'],
      infringingUrls: ['https://example.com/stolen1', 'https://example.com/stolen2'],
      description: 'Unauthorized use of artwork on social media platforms'
    },
    {
      id: '2',
      imageUrl: '/placeholder.svg',
      platforms: ['Google Images'],
      infringingUrls: ['https://example.com/stolen3'],
      description: 'AI-generated derivative found in search results'
    }
  ]);

  const handleProtectionAction = async () => {
    if (!selectedCase || selectedOptions.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select a case and protection options.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('one-click-protect', {
        body: {
          caseId: selectedCase.id,
          protectionTypes: selectedOptions,
          targetPlatforms: selectedCase.platforms,
          infringingUrls: selectedCase.infringingUrls,
          customMessage,
          automationSettings: {
            followUp: true,
            escalateOnFailure: true,
            trackProgress: true
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Protection Initiated",
        description: `${selectedOptions.length} protection actions started successfully.`,
      });

      // Reset form
      setSelectedCase(null);
      setSelectedOptions([]);
      setCustomMessage('');

    } catch (error) {
      console.error('Protection action error:', error);
      toast({
        title: "Protection Failed",
        description: "Failed to initiate protection actions.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleOption = (optionId: string) => {
    setSelectedOptions(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">One-Click Protection</h1>
          <p className="text-muted-foreground">
            Automated legal actions and takedown requests for copyright infringement
          </p>
        </div>
        <Badge variant="outline" className="text-primary">
          <Shield className="h-4 w-4 mr-1" />
          Legal Protection Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Case Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Infringement Case</CardTitle>
            <CardDescription>
              Choose from detected copyright infringements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cases.map((infringementCase) => (
              <div
                key={infringementCase.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedCase?.id === infringementCase.id 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:border-muted-foreground'
                }`}
                onClick={() => setSelectedCase(infringementCase)}
              >
                <div className="flex items-start space-x-3">
                  <img 
                    src={infringementCase.imageUrl} 
                    alt="Artwork" 
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{infringementCase.description}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Platforms: {infringementCase.platforms.join(', ')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {infringementCase.infringingUrls.length} infringing URLs detected
                    </div>
                  </div>
                  {selectedCase?.id === infringementCase.id && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </div>
              </div>
            ))}

            {cases.length === 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No infringement cases detected. Run AI monitoring to find potential violations.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Protection Options */}
        <Card>
          <CardHeader>
            <CardTitle>Protection Actions</CardTitle>
            <CardDescription>
              Select automated protection measures to deploy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {PROTECTION_OPTIONS.map((option) => (
              <div
                key={option.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedOptions.includes(option.id)
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-muted-foreground'
                }`}
                onClick={() => toggleOption(option.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      checked={selectedOptions.includes(option.id)}
                      onChange={() => toggleOption(option.id)}
                    />
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {option.description}
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {option.estimatedTime}
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {option.successRate}% success rate
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Custom Message */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Message (Optional)</label>
              <Textarea
                placeholder="Add any specific details or demands for the protection action..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
              />
            </div>

            {/* Action Button */}
            <Button 
              onClick={handleProtectionAction}
              disabled={!selectedCase || selectedOptions.length === 0 || isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Deploy Protection ({selectedOptions.length} actions)
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Protection Status */}
      {selectedCase && selectedOptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Protection Summary</CardTitle>
            <CardDescription>
              Preview of actions that will be taken
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Target Case:</span>
                <span>{selectedCase.description}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Platforms:</span>
                <span>{selectedCase.platforms.join(', ')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Actions:</span>
                <span>{selectedOptions.length} protection measures</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Estimated Time:</span>
                <span>24-48 hours for initial response</span>
              </div>
            </div>

            <Alert className="mt-4">
              <FileText className="h-4 w-4" />
              <AlertDescription>
                All protection actions are logged and tracked. You'll receive notifications 
                on progress and can escalate if needed.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}