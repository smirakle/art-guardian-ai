import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, TrendingUp, AlertTriangle, Shield, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ReportData {
  totalScans: number;
  totalAlerts: number;
  highRiskProfiles: number;
  platformsCovered: number;
  identityTheftRisk: number;
  impersonationRisk: number;
  brandDamageRisk: number;
  financialRisk: number;
  platformBreakdown: Record<string, number>;
  timelineData: Array<{
    date: string;
    scans: number;
    alerts: number;
    risk_score: number;
  }>;
}

export const ProfileReporting: React.FC = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  });
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'executive'>('summary');

  useEffect(() => {
    if (user) {
      generateReport();
    }
  }, [user, dateRange]);

  const generateReport = async () => {
    setLoading(true);
    try {
      // Get scan results within date range
      const { data: scanResults } = await supabase
        .from('profile_scan_results')
        .select(`
          *,
          profile_monitoring_targets!inner(user_id)
        `)
        .eq('profile_monitoring_targets.user_id', user?.id)
        .gte('detected_at', dateRange.from.toISOString())
        .lte('detected_at', dateRange.to.toISOString());

      // Get alerts within date range
      const { data: alerts } = await supabase
        .from('profile_impersonation_alerts')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      // Get risk assessments
      const { data: riskAssessments } = await supabase
        .from('profile_risk_assessments')
        .select(`
          *,
          profile_monitoring_targets!inner(user_id)
        `)
        .eq('profile_monitoring_targets.user_id', user?.id);

      // Calculate platform breakdown
      const platformBreakdown = scanResults?.reduce((acc, result) => {
        acc[result.platform] = (acc[result.platform] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Calculate average risks
      const avgRisks = riskAssessments?.reduce(
        (acc, assessment) => ({
          identity_theft: acc.identity_theft + assessment.identity_theft_risk,
          impersonation: acc.impersonation + assessment.impersonation_risk,
          brand_damage: acc.brand_damage + assessment.brand_damage_risk,
          financial: acc.financial + assessment.financial_risk,
        }),
        { identity_theft: 0, impersonation: 0, brand_damage: 0, financial: 0 }
      );

      const assessmentCount = riskAssessments?.length || 1;

      setReportData({
        totalScans: scanResults?.length || 0,
        totalAlerts: alerts?.length || 0,
        highRiskProfiles: riskAssessments?.filter(r => r.overall_risk_score >= 70).length || 0,
        platformsCovered: Object.keys(platformBreakdown).length,
        identityTheftRisk: Math.round((avgRisks?.identity_theft || 0) / assessmentCount),
        impersonationRisk: Math.round((avgRisks?.impersonation || 0) / assessmentCount),
        brandDamageRisk: Math.round((avgRisks?.brand_damage || 0) / assessmentCount),
        financialRisk: Math.round((avgRisks?.financial || 0) / assessmentCount),
        platformBreakdown,
        timelineData: [] // Would be populated with daily aggregated data
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'csv' | 'json') => {
    setGenerating(true);
    try {
      const { error } = await supabase.functions.invoke('generate-profile-report', {
        body: {
          userId: user?.id,
          dateRange,
          reportType,
          format,
          data: reportData
        }
      });

      if (error) throw error;
      
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    } finally {
      setGenerating(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/3"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Profile Monitoring Reports</h2>
          <p className="text-muted-foreground">Comprehensive analytics and insights</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => exportReport('pdf')}
            disabled={generating}
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button 
            variant="outline" 
            onClick={() => exportReport('csv')}
            disabled={generating}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Executive Summary</SelectItem>
                  <SelectItem value="detailed">Detailed Analysis</SelectItem>
                  <SelectItem value="executive">Executive Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dateRange.from, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => date && setDateRange(prev => ({ ...prev, from: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">To Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dateRange.to, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => date && setDateRange(prev => ({ ...prev, to: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.totalScans}</div>
                <p className="text-xs text-muted-foreground">
                  Profile scans completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{reportData.totalAlerts}</div>
                <p className="text-xs text-muted-foreground">
                  Impersonation alerts triggered
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Risk Profiles</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">{reportData.highRiskProfiles}</div>
                <p className="text-xs text-muted-foreground">
                  Profiles requiring attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Platform Coverage</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.platformsCovered}</div>
                <p className="text-xs text-muted-foreground">
                  Platforms monitored
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Risk Assessment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment Summary</CardTitle>
              <CardDescription>Average risk scores across all monitored profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getRiskColor(reportData.identityTheftRisk)}`}>
                    {reportData.identityTheftRisk}%
                  </div>
                  <p className="text-sm text-muted-foreground">Identity Theft Risk</p>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getRiskColor(reportData.impersonationRisk)}`}>
                    {reportData.impersonationRisk}%
                  </div>
                  <p className="text-sm text-muted-foreground">Impersonation Risk</p>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getRiskColor(reportData.brandDamageRisk)}`}>
                    {reportData.brandDamageRisk}%
                  </div>
                  <p className="text-sm text-muted-foreground">Brand Damage Risk</p>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getRiskColor(reportData.financialRisk)}`}>
                    {reportData.financialRisk}%
                  </div>
                  <p className="text-sm text-muted-foreground">Financial Risk</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Activity Breakdown</CardTitle>
              <CardDescription>Scan results distribution across platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(reportData.platformBreakdown).map(([platform, count]) => (
                  <div key={platform} className="flex items-center justify-between">
                    <span className="font-medium">{platform}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{count} results</Badge>
                      <div className="w-24 h-2 bg-muted rounded">
                        <div 
                          className="h-full bg-primary rounded"
                          style={{ 
                            width: `${(count / Math.max(...Object.values(reportData.platformBreakdown))) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Executive Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose max-w-none">
                <h4>Security Overview</h4>
                <p>
                  During the reporting period from {format(dateRange.from, "PPP")} to {format(dateRange.to, "PPP")}, 
                  our comprehensive profile monitoring system conducted {reportData.totalScans} scans across {reportData.platformsCovered} platforms.
                </p>
                
                <h4>Key Findings</h4>
                <ul>
                  <li>
                    <strong>{reportData.totalAlerts} security alerts</strong> were triggered, requiring immediate attention.
                  </li>
                  <li>
                    <strong>{reportData.highRiskProfiles} profiles</strong> were classified as high-risk and need enhanced monitoring.
                  </li>
                  <li>
                    The average impersonation risk across all profiles is <strong>{reportData.impersonationRisk}%</strong>.
                  </li>
                  <li>
                    Most activity was detected on {Object.entries(reportData.platformBreakdown).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'} platform.
                  </li>
                </ul>

                <h4>Recommendations</h4>
                <ul>
                  <li>Increase monitoring frequency for high-risk profiles</li>
                  <li>Implement automated response protocols for critical alerts</li>
                  <li>Expand monitoring to additional platforms if necessary</li>
                  <li>Review and update identity protection policies</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};