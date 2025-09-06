import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { FoundingPartnerBriefGenerator } from '@/lib/foundingPartnerBrief';
import { Download, Lock, Loader2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';

const FoundingPartnerBriefDownload = () => {
  const [loading, setLoading] = useState(false);
  const [accessRequested, setAccessRequested] = useState(false);
  const { toast } = useToast();
  const { track } = useAnalytics();

  const handleDownload = async () => {
    if (!accessRequested) {
      setAccessRequested(true);
      toast({
        title: "Access Required",
        description: "Please request access to download the Founding Partner Brief. Contact investors@tsmo.com",
        variant: "default"
      });
      
      track('founding_partner_brief_access_requested', {
        location: 'investor_hub',
        timestamp: Date.now()
      });
      return;
    }

    setLoading(true);
    
    try {
      // Fetch live metrics from edge function
      const { data, error } = await supabase.functions.invoke('investor-brief-metrics');
      
      if (error) {
        throw error;
      }

      const metrics = data.metrics;
      const generatedAt = data.generatedAt;

      // Generate PDF
      const pdfBytes = FoundingPartnerBriefGenerator.generateBrief(metrics, generatedAt);
      
      // Download PDF
      FoundingPartnerBriefGenerator.downloadBrief(pdfBytes);

      track('founding_partner_brief_downloaded', {
        location: 'investor_hub',
        metrics_timestamp: generatedAt,
        user_count: metrics.traction.totalUsers,
        protected_assets: metrics.traction.protectedAssets
      });

      toast({
        title: "Brief Downloaded",
        description: "The Founding Partner Brief has been downloaded with live metrics.",
        variant: "default"
      });

    } catch (error) {
      console.error('Error generating founding partner brief:', error);
      
      toast({
        title: "Download Error",
        description: "Unable to generate brief. Please try again or contact support.",
        variant: "destructive"
      });

      track('founding_partner_brief_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        location: 'investor_hub'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = () => {
    setAccessRequested(true);
    window.open('mailto:investors@tsmo.com?subject=Founding Partner Brief Access Request&body=I would like to request access to the TSMO Founding Partner Brief.', '_blank');
    
    track('founding_partner_brief_access_email', {
      location: 'investor_hub'
    });
  };

  if (!accessRequested) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          Access required for qualified investors
        </div>
        <div className="flex gap-2 justify-center">
          <Button onClick={handleRequestAccess} variant="outline" className="gap-2">
            <Shield className="h-4 w-4" />
            Request Access
          </Button>
          <Button 
            onClick={handleDownload}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download Brief
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Contains proprietary metrics and confidential information
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-2 text-sm text-green-600">
        <Shield className="h-4 w-4" />
        Access requested - Download available
      </div>
      <Button 
        onClick={handleDownload}
        disabled={loading}
        className="gap-2"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Download Live Brief
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        PDF includes real-time metrics and operational data
      </p>
    </div>
  );
};

export default FoundingPartnerBriefDownload;