import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const AITPSetupBanner = () => {
  const [readinessStatus, setReadinessStatus] = useState<'checking' | 'ready' | 'needs_attention'>('checking');
  const [missingItems, setMissingItems] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    checkReadiness();
  }, []);

  const checkReadiness = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('aitp-readiness-check');
      
      if (error) {
        console.error('Readiness check error:', error);
        setReadinessStatus('needs_attention');
        setMissingItems(['Unable to check system status']);
        return;
      }

      if (data.status === 'ok') {
        setReadinessStatus('ready');
        setMissingItems([]);
      } else {
        setReadinessStatus('needs_attention');
        const missing = data.checks
          ?.filter((check: any) => !check.ok)
          .map((check: any) => check.name) || [];
        setMissingItems(missing);
      }
    } catch (error) {
      console.error('Error checking readiness:', error);
      setReadinessStatus('needs_attention');
    }
  };

  if (readinessStatus === 'checking') {
    return null; // Don't show banner while checking
  }

  if (readinessStatus === 'ready') {
    return (
      <Alert className="mb-6 border-success bg-success/10">
        <CheckCircle className="h-4 w-4 text-success" />
        <AlertTitle>AI Training Protection is Ready</AlertTitle>
        <AlertDescription>
          All systems are operational. Your content is being monitored for unauthorized AI training usage.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-6 border-warning bg-warning/10">
      <AlertTriangle className="h-4 w-4 text-warning" />
      <AlertTitle>Setup Required for Full Protection</AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p>
          Basic protection is active, but some features require additional configuration:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          {missingItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <div className="flex gap-2 mt-4">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              toast({
                title: "Setup Guide",
                description: "Configure API keys in your Supabase project settings under Edge Function Secrets. Required: OPENAI_API_KEY, GOOGLE_CUSTOM_SEARCH_API_KEY, RESEND_API_KEY."
              });
            }}
          >
            <Settings className="w-4 h-4 mr-2" />
            Setup Instructions
          </Button>
          <Button 
            size="sm"
            onClick={checkReadiness}
          >
            Re-check Status
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
