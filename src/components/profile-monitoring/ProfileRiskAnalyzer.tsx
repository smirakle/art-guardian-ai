import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface RiskAssessment {
  id: string;
  target_id: string;
  overall_risk_score: number;
  identity_theft_risk: number;
  impersonation_risk: number;
  brand_damage_risk: number;
  financial_risk: number;
  assessment_factors: any;
  recommendations: string[];
  last_updated: string;
  target: {
    target_name: string;
    monitoring_enabled: boolean;
  };
}

interface RiskTrend {
  date: string;
  risk_score: number;
}

export const ProfileRiskAnalyzer: React.FC = () => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadRiskAssessments();
    }
  }, [user]);

  const loadRiskAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from('profile_risk_assessments')
        .select(`
          *,
          target:profile_monitoring_targets(target_name, monitoring_enabled)
        `)
        .eq('profile_monitoring_targets.user_id', user?.id)
        .order('last_updated', { ascending: false });

      if (error) throw error;
      setAssessments(data || []);
    } catch (error) {
      console.error('Error loading risk assessments:', error);
      toast.error('Failed to load risk assessments');
    } finally {
      setLoading(false);
    }
  };

  const generateRiskAssessment = async (targetId: string) => {
    setRefreshing(true);
    try {
      const { error } = await supabase.functions.invoke('profile-risk-analyzer', {
        body: { targetId, action: 'generate_assessment' }
      });

      if (error) throw error;
      
      toast.success('Risk assessment updated');
      loadRiskAssessments();
    } catch (error) {
      console.error('Error generating risk assessment:', error);
      toast.error('Failed to generate risk assessment');
    } finally {
      setRefreshing(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getRiskLevel = (score: number) => {
    if (score >= 70) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  };

  const getRiskBadgeVariant = (score: number) => {
    if (score >= 70) return 'destructive';
    if (score >= 40) return 'default';
    return 'secondary';
  };

  const calculateAverageRisk = () => {
    if (assessments.length === 0) return 0;
    const total = assessments.reduce((sum, assessment) => sum + assessment.overall_risk_score, 0);
    return Math.round(total / assessments.length);
  };

  const getHighRiskCount = () => {
    return assessments.filter(assessment => assessment.overall_risk_score >= 70).length;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted rounded w-2/3"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const averageRisk = calculateAverageRisk();
  const highRiskCount = getHighRiskCount();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Risk Analysis</h2>
          <p className="text-muted-foreground">Monitor identity and brand risk across all profiles</p>
        </div>
        <Button onClick={() => loadRiskAssessments()} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Risk Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getRiskColor(averageRisk)}`}>
              {averageRisk}%
            </div>
            <p className="text-xs text-muted-foreground">
              Risk Level: {getRiskLevel(averageRisk)}
            </p>
            <Progress value={averageRisk} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Profiles</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {highRiskCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of {assessments.length} total profiles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              Stable
            </div>
            <p className="text-xs text-muted-foreground">
              No significant changes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Assessments */}
      <div className="space-y-4">
        {assessments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Shield className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No risk assessments available</p>
              <p className="text-sm text-muted-foreground">Add monitoring targets to generate risk assessments</p>
            </CardContent>
          </Card>
        ) : (
          assessments.map((assessment) => (
            <Card key={assessment.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {assessment.target?.target_name}
                      <Badge variant={getRiskBadgeVariant(assessment.overall_risk_score)}>
                        {getRiskLevel(assessment.overall_risk_score)} Risk
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Last updated: {new Date(assessment.last_updated).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className={`text-3xl font-bold ${getRiskColor(assessment.overall_risk_score)}`}>
                    {assessment.overall_risk_score}%
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Risk Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Identity Theft</span>
                      <span className="text-sm text-muted-foreground">
                        {assessment.identity_theft_risk}%
                      </span>
                    </div>
                    <Progress value={assessment.identity_theft_risk} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Impersonation</span>
                      <span className="text-sm text-muted-foreground">
                        {assessment.impersonation_risk}%
                      </span>
                    </div>
                    <Progress value={assessment.impersonation_risk} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Brand Damage</span>
                      <span className="text-sm text-muted-foreground">
                        {assessment.brand_damage_risk}%
                      </span>
                    </div>
                    <Progress value={assessment.brand_damage_risk} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Financial Risk</span>
                      <span className="text-sm text-muted-foreground">
                        {assessment.financial_risk}%
                      </span>
                    </div>
                    <Progress value={assessment.financial_risk} />
                  </div>
                </div>

                {/* Recommendations */}
                {assessment.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Recommendations</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {assessment.recommendations.map((recommendation, index) => (
                        <li key={index}>{recommendation}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Risk Factors */}
                {Object.keys(assessment.assessment_factors).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Risk Factors</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(assessment.assessment_factors).map(([factor, value]) => (
                        <div key={factor} className="flex justify-between">
                          <span className="capitalize">{factor.replace('_', ' ')}:</span>
                          <span className="text-muted-foreground">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => generateRiskAssessment(assessment.target_id)}
                    disabled={refreshing}
                  >
                    Update Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};