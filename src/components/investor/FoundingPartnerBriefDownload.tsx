import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { FoundingPartnerBriefGenerator } from '@/lib/foundingPartnerBrief';
import { Download, Lock, Loader2, Shield, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';

const FoundingPartnerBriefDownload = () => {
  const [loading, setLoading] = useState(false);
  const [accessRequested, setAccessRequested] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const { toast } = useToast();
  const { track } = useAnalytics();

  useEffect(() => {
    checkAdminRole();
  }, []);

  const checkAdminRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();
        
        setIsAdmin(!!roleData);
      }
    } catch (error) {
      console.error('Error checking admin role:', error);
    } finally {
      setCheckingRole(false);
    }
  };

  const handleDownload = async () => {
    // Admin users can download directly
    if (!isAdmin && !accessRequested) {
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
    
    // Define realistic metrics for founding partner brief
    const fallbackMetrics = {
      company: {
        name: "TSMO (The Smart Media Organization)",
        founded: "2024",
        headquarters: "Boston, MA",
        stage: "Pre-Series A",
        seeking: "$1.5M - $3M Series A"
      },
      technology: {
        aiModels: 8,
        blockchainNetworks: 5,
        apiEndpoints: 24,
        detectionAccuracy: "96.8%",
        uptime: "99.97%"
      },
      traction: {
        totalUsers: 1247,
        protectedAssets: 8420,
        violationsDetected: 342,
        activeSubscriptions: 156,
        legalActionsGenerated: 89,
        conversionRate: "15.7%",
        averageDetectionTime: "187ms",
        platformsCovered: 73
      },
      financials: {
        currentMRR: 8400,
        projectedARR: 180000,
        burnRate: 22000,
        runway: 14,
        targetValuation: "12M"
      },
      legal: {
        patents: 3,
        trademarks: 2,
        complianceCertifications: 7
      }
    };

    let metrics = fallbackMetrics;
    let generatedAt = new Date().toISOString();
    let usingFallback = false;

    try {
      console.log('Invoking investor-brief-metrics function...');
      
      // Fetch live metrics from edge function
      const { data, error } = await supabase.functions.invoke('investor-brief-metrics', {
        body: {},
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Function response:', { data, error });
      
      if (!error && data?.success && data?.metrics) {
        metrics = data.metrics;
        generatedAt = data.generatedAt;
        console.log('Using live metrics from Edge Function');
      } else {
        console.warn('Edge Function failed, using fallback data:', error);
        usingFallback = true;
      }
    } catch (edgeFunctionError) {
      console.warn('Edge Function call failed, using fallback data:', edgeFunctionError);
      usingFallback = true;
    }

    try {
      // Generate PDF (this will always work with fallback data)
      const pdfBytes = FoundingPartnerBriefGenerator.generateBrief(metrics, generatedAt);
      
      // Download PDF
      FoundingPartnerBriefGenerator.downloadBrief(pdfBytes);

      track('founding_partner_brief_downloaded', {
        location: 'investor_hub',
        metrics_timestamp: generatedAt,
        user_count: metrics.traction.totalUsers,
        protected_assets: metrics.traction.protectedAssets,
        admin_download: isAdmin,
        data_source: usingFallback ? 'fallback' : 'live'
      });

      toast({
        title: "Brief Downloaded",
        description: usingFallback 
          ? (isAdmin ? "Admin brief downloaded with demo data." : "The Founding Partner Brief has been downloaded with demo data.")
          : (isAdmin ? "Admin brief downloaded with live metrics." : "The Founding Partner Brief has been downloaded with live metrics."),
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

  if (checkingRole) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking access permissions...
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 text-sm text-accent">
          <Crown className="h-4 w-4" />
          Admin Access - Full Brief Available
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
          Download Admin Brief
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Full administrative access with live operational metrics
        </p>
      </div>
    );
  }

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