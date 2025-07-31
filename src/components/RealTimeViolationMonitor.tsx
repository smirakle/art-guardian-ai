import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Shield, Zap, Globe, Eye } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ViolationData {
  id: string;
  violation_type: string;
  source_url: string;
  source_domain: string;
  confidence_score: number;
  detected_at: string;
  evidence_data: any;
  status: string;
}

interface RealTimeViolationMonitorProps {
  protectionRecordId?: string;
  userId?: string;
  autoRefresh?: boolean;
}

export const RealTimeViolationMonitor: React.FC<RealTimeViolationMonitorProps> = ({
  protectionRecordId,
  userId,
  autoRefresh = true
}) => {
  const { toast } = useToast();
  const [violations, setViolations] = useState<ViolationData[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [threatLevel, setThreatLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [realTimeStats, setRealTimeStats] = useState({
    activeScanners: 0,
    platformsMonitored: 0,
    threatsDetected: 0,
    lastUpdate: new Date().toISOString()
  });

  // Fetch violations from database
  const fetchViolations = async () => {
    try {
      let query = supabase
        .from('ai_training_violations')
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(10);

      if (protectionRecordId) {
        query = query.eq('protection_record_id', protectionRecordId);
      } else if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching violations:', error);
        return;
      }

      setViolations(data || []);
      
      // Calculate threat level based on recent violations
      const recentViolations = data?.filter(v => 
        new Date(v.detected_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ) || [];
      
      const highConfidence = recentViolations.filter(v => v.confidence_score > 85).length;
      const newThreatLevel = highConfidence > 2 ? 'high' : 
                           recentViolations.length > 0 ? 'medium' : 'low';
      setThreatLevel(newThreatLevel);

    } catch (error) {
      console.error('Failed to fetch violations:', error);
    }
  };

  // Start real-time monitoring
  const startMonitoring = async () => {
    if (!protectionRecordId) {
      toast({
        title: "No Protection Record",
        description: "Please apply protection to a file first.",
        variant: "destructive"
      });
      return;
    }

    setIsMonitoring(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-training-protection-monitor', {
        body: {
          protectionRecordId,
          enableRealTimeScanning: true,
          scanType: 'realtime'
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        setRealTimeStats({
          activeScanners: 5,
          platformsMonitored: data.real_time_intelligence?.monitored_platforms || 8,
          threatsDetected: data.violations_detected || 0,
          lastUpdate: new Date().toISOString()
        });

        toast({
          title: "Real-Time Monitoring Active",
          description: `Detected ${data.violations_detected} potential violations. Threat level: ${data.overall_threat_level}`,
          duration: 5000
        });

        // Refresh violations data
        await fetchViolations();
      }
    } catch (error) {
      console.error('Failed to start monitoring:', error);
      toast({
        title: "Monitoring Failed",
        description: "Unable to start real-time monitoring. Please try again.",
        variant: "destructive"
      });
      setIsMonitoring(false);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      fetchViolations();
      
      const interval = setInterval(() => {
        fetchViolations();
        setRealTimeStats(prev => ({
          ...prev,
          lastUpdate: new Date().toISOString()
        }));
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, protectionRecordId, userId]);

  // Real-time subscription for violations
  useEffect(() => {
    const channel = supabase
      .channel('ai-training-violations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_training_violations',
          filter: protectionRecordId ? `protection_record_id=eq.${protectionRecordId}` : undefined
        },
        (payload) => {
          console.log('New violation detected:', payload);
          setViolations(prev => [payload.new as ViolationData, ...prev.slice(0, 9)]);
          
          // Show notification for high-confidence violations
          if (payload.new.confidence_score > 80) {
            toast({
              title: "High-Confidence Violation Detected",
              description: `${payload.new.violation_type.replace('_', ' ')} on ${payload.new.source_domain}`,
              variant: "destructive"
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [protectionRecordId, toast]);

  const getThreatLevelColor = () => {
    switch (threatLevel) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getViolationIcon = (type: string) => {
    switch (type) {
      case 'unauthorized_training': return <AlertCircle className="w-4 h-4" />;
      case 'data_scraping': return <Globe className="w-4 h-4" />;
      case 'model_extraction': return <Eye className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-Time Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Real-Time AI Training Violation Monitor
          </CardTitle>
          <CardDescription>
            Live monitoring for unauthorized AI training and data usage
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Threat Level */}
          <div className={`p-4 rounded-lg border ${getThreatLevelColor()}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Current Threat Level</h3>
              <Badge variant={threatLevel === 'high' ? 'destructive' : threatLevel === 'medium' ? 'secondary' : 'default'}>
                {threatLevel.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm">
              {threatLevel === 'high' && '⚠️ High unauthorized usage detected across multiple platforms'}
              {threatLevel === 'medium' && '🔍 Moderate AI training activity detected'}
              {threatLevel === 'low' && '✅ Low threat environment, minimal suspicious activity'}
            </p>
          </div>

          {/* Real-Time Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{realTimeStats.activeScanners}</div>
              <div className="text-xs text-blue-600">Active Scanners</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{realTimeStats.platformsMonitored}</div>
              <div className="text-xs text-green-600">Platforms Monitored</div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{realTimeStats.threatsDetected}</div>
              <div className="text-xs text-orange-600">Threats Detected</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {isMonitoring ? (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    LIVE
                  </div>
                ) : 'IDLE'}
              </div>
              <div className="text-xs text-purple-600">Status</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <Button 
              onClick={startMonitoring}
              disabled={isMonitoring}
              className="flex-1"
            >
              <Zap className="w-4 h-4 mr-2" />
              {isMonitoring ? 'Monitoring Active' : 'Start Real-Time Scan'}
            </Button>
            <Button 
              variant="outline" 
              onClick={fetchViolations}
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Violations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Violations</CardTitle>
          <CardDescription>
            Latest AI training violations detected in real-time
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {violations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No violations detected</p>
              <p className="text-sm">Your content is currently protected</p>
            </div>
          ) : (
            <div className="space-y-3">
              {violations.map((violation) => (
                <div key={violation.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="p-2 bg-red-50 text-red-600 rounded-md">
                    {getViolationIcon(violation.violation_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {violation.violation_type.replace('_', ' ').toUpperCase()}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {violation.confidence_score}% confidence
                      </Badge>
                      {violation.evidence_data?.real_time_detection && (
                        <Badge variant="secondary" className="text-xs">LIVE</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Detected on {violation.source_domain}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{new Date(violation.detected_at).toLocaleString()}</span>
                      <Badge variant={violation.status === 'pending' ? 'secondary' : 'default'}>
                        {violation.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};