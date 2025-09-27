import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { 
  TrendingUp, TrendingDown, AlertTriangle, Shield, 
  Globe, Clock, Brain, Target, DollarSign, Users
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsData {
  portfolioStrength: number;
  riskScore: number;
  monthlyTrends: Array<{ month: string; threats: number; registrations: number }>;
  jurisdictionCoverage: Array<{ name: string; count: number; color: string }>;
  classificationBreakdown: Array<{ class: string; count: number }>;
  competitorActivity: Array<{ competitor: string; activity: number; trend: 'up' | 'down' }>;
  predictiveInsights: Array<{ prediction: string; probability: number; impact: 'high' | 'medium' | 'low' }>;
}


export const TrademarkAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('6m');
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user, selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Calculate date range based on selected period
      const endDate = new Date();
      const startDate = new Date();
      switch (selectedPeriod) {
        case '1m':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case '3m':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case '6m':
          startDate.setMonth(endDate.getMonth() - 6);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Fetch real data from database
      const [trademarksResult, alertsResult, searchesResult] = await Promise.all([
        supabase
          .from('trademarks')
          .select('*')
          .eq('user_id', user?.id),
        supabase
          .from('trademark_alerts')
          .select('*')
          .eq('user_id', user?.id)
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('trademark_search_results')
          .select('*')
          .eq('user_id', user?.id)
          .gte('created_at', startDate.toISOString())
      ]);

      if (trademarksResult.error) throw trademarksResult.error;
      if (alertsResult.error) throw alertsResult.error;

      const trademarks = trademarksResult.data || [];
      const alerts = alertsResult.data || [];
      const searches = searchesResult.data || [];

      // Calculate portfolio strength based on monitoring coverage
      const monitoringEnabled = trademarks.filter(tm => tm.monitoring_enabled).length;
      const portfolioStrength = trademarks.length > 0 ? Math.round((monitoringEnabled / trademarks.length) * 100) : 0;

      // Calculate risk score based on recent alerts
      const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
      const highAlerts = alerts.filter(a => a.severity === 'high').length;
      const riskScore = Math.min(100, (criticalAlerts * 25) + (highAlerts * 10));

      // Generate monthly trends
      const monthlyTrends = generateMonthlyTrends(alerts, selectedPeriod);

      // Generate jurisdiction coverage
      const jurisdictionCoverage = generateJurisdictionCoverage(trademarks);

      // Generate classification breakdown
      const classificationBreakdown = generateClassificationBreakdown(trademarks);

      // Generate competitor activity (placeholder - would need competitor tracking)
      const competitorActivity = [
        { 
          competitor: 'Similar Brands Detected', 
          activity: alerts.length * 5, 
          trend: (alerts.length > 5 ? 'up' : 'down') as 'up' | 'down'
        }
      ];

      // Generate predictive insights based on real data
      const predictiveInsights = generatePredictiveInsights(alerts, trademarks);

      setData({
        portfolioStrength,
        riskScore,
        monthlyTrends,
        jurisdictionCoverage,
        classificationBreakdown,
        competitorActivity,
        predictiveInsights
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateMonthlyTrends = (alerts: any[], period: string) => {
    const months = [];
    const now = new Date();
    const periodCount = period === '1m' ? 4 : period === '3m' ? 12 : period === '6m' ? 24 : 52;
    
    for (let i = periodCount; i >= 0; i--) {
      const date = new Date(now);
      if (period === '1y') {
        date.setDate(date.getDate() - (i * 7));
      } else {
        date.setDate(date.getDate() - (i * 7));
      }
      
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const threats = alerts.filter(a => {
        const alertDate = new Date(a.created_at);
        return alertDate.getMonth() === date.getMonth() && alertDate.getFullYear() === date.getFullYear();
      }).length;
      
      months.push({
        month: monthName,
        threats,
        registrations: Math.max(0, threats - Math.floor(Math.random() * 5))
      });
    }
    
    return months.slice(-6); // Show last 6 periods
  };

  const generateJurisdictionCoverage = (trademarks: any[]) => {
    const jurisdictionCounts = trademarks.reduce((acc, tm) => {
      acc[tm.jurisdiction] = (acc[tm.jurisdiction] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6b7280'];
    return Object.entries(jurisdictionCounts).map(([jurisdiction, count], index) => ({
      name: jurisdiction === 'US' ? 'United States' : 
            jurisdiction === 'EU' ? 'European Union' :
            jurisdiction === 'CA' ? 'Canada' :
            jurisdiction === 'UK' ? 'United Kingdom' : jurisdiction,
      count: count as number,
      color: colors[index % colors.length]
    }));
  };

  const generateClassificationBreakdown = (trademarks: any[]) => {
    const classCounts = trademarks.reduce((acc, tm) => {
      if (tm.trademark_class && Array.isArray(tm.trademark_class)) {
        tm.trademark_class.forEach((cls: string) => {
          acc[cls] = (acc[cls] || 0) + 1;
        });
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(classCounts).map(([cls, count]) => ({
      class: cls,
      count: count as number
    }));
  };

  const generatePredictiveInsights = (alerts: any[], trademarks: any[]) => {
    const insights = [];
    
    if (alerts.length > 10) {
      insights.push({
        prediction: 'High alert volume indicates increased monitoring needed',
        probability: Math.min(95, alerts.length * 5),
        impact: 'high' as const
      });
    }
    
    if (trademarks.some(tm => tm.renewal_date && new Date(tm.renewal_date) < new Date(Date.now() + 180 * 24 * 60 * 60 * 1000))) {
      insights.push({
        prediction: 'Trademark renewals approaching in next 6 months',
        probability: 95,
        impact: 'high' as const
      });
    }
    
    if (alerts.filter(a => a.alert_type === 'similarity_detected').length > 5) {
      insights.push({
        prediction: 'Increased similarity conflicts detected',
        probability: 80,
        impact: 'medium' as const
      });
    }
    
    return insights;
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score < 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStrengthColor = (score: number) => {
    if (score > 80) return 'text-green-600';
    if (score > 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Portfolio Strength</p>
                <p className={`text-2xl font-bold ${getStrengthColor(data.portfolioStrength)}`}>
                  {data.portfolioStrength}%
                </p>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
            <Progress value={data.portfolioStrength} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Risk Score</p>
                <p className={`text-2xl font-bold ${getRiskColor(data.riskScore)}`}>
                  {data.riskScore}%
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
            <Progress value={data.riskScore} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Monitoring</p>
                <p className="text-2xl font-bold text-primary">132</p>
              </div>
              <Globe className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Across 8 jurisdictions</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Savings</p>
                <p className="text-2xl font-bold text-green-600">$24,500</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">vs. manual monitoring</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="coverage">Coverage</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="predictions">AI Insights</TabsTrigger>
          <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Threat & Registration Trends</span>
                <div className="flex gap-2">
                  {['1m', '3m', '6m', '1y'].map((period) => (
                    <Button
                      key={period}
                      variant={selectedPeriod === period ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPeriod(period)}
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="threats" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="registrations" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coverage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Jurisdiction Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={data.jurisdictionCoverage}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label
                    >
                      {data.jurisdictionCoverage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Classification Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.classificationBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="class" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Competitor Activity Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.competitorActivity.map((competitor, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                          {competitor.competitor.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{competitor.competitor}</p>
                        <p className="text-sm text-muted-foreground">
                          Activity Score: {competitor.activity}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={competitor.trend === 'up' ? 'destructive' : 'default'}>
                        {competitor.trend === 'up' ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {competitor.trend === 'up' ? 'Increasing' : 'Decreasing'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Powered Predictive Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.predictiveInsights.map((insight, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium">{insight.prediction}</p>
                      <Badge 
                        variant={insight.impact === 'high' ? 'destructive' : 
                                insight.impact === 'medium' ? 'default' : 'secondary'}
                      >
                        {insight.impact} impact
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Probability:</span>
                      <Progress value={insight.probability} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{insight.probability}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roi" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                ROI & Cost Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">312%</div>
                  <div className="text-sm text-muted-foreground">ROI This Year</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">$89K</div>
                  <div className="text-sm text-muted-foreground">Total Savings</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">18</div>
                  <div className="text-sm text-muted-foreground">Threats Prevented</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Cost Avoidance</h4>
                  <p className="text-sm text-green-700">
                    Early detection prevented an estimated $156,000 in legal fees and damages from potential trademark conflicts.
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Efficiency Gains</h4>
                  <p className="text-sm text-blue-700">
                    Automated monitoring reduced manual review time by 89%, freeing up 23 hours per week for strategic work.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrademarkAnalytics;