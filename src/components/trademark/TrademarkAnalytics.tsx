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

interface AnalyticsData {
  portfolioStrength: number;
  riskScore: number;
  monthlyTrends: Array<{ month: string; threats: number; registrations: number }>;
  jurisdictionCoverage: Array<{ name: string; count: number; color: string }>;
  classificationBreakdown: Array<{ class: string; count: number }>;
  competitorActivity: Array<{ competitor: string; activity: number; trend: 'up' | 'down' }>;
  predictiveInsights: Array<{ prediction: string; probability: number; impact: 'high' | 'medium' | 'low' }>;
}

const mockAnalyticsData: AnalyticsData = {
  portfolioStrength: 85,
  riskScore: 23,
  monthlyTrends: [
    { month: 'Jan', threats: 12, registrations: 8 },
    { month: 'Feb', threats: 8, registrations: 15 },
    { month: 'Mar', threats: 15, registrations: 12 },
    { month: 'Apr', threats: 20, registrations: 18 },
    { month: 'May', threats: 10, registrations: 22 },
    { month: 'Jun', threats: 25, registrations: 28 }
  ],
  jurisdictionCoverage: [
    { name: 'United States', count: 45, color: '#3b82f6' },
    { name: 'European Union', count: 32, color: '#10b981' },
    { name: 'Canada', count: 18, color: '#f59e0b' },
    { name: 'United Kingdom', count: 25, color: '#ef4444' },
    { name: 'Other', count: 12, color: '#6b7280' }
  ],
  classificationBreakdown: [
    { class: 'Class 9 (Tech)', count: 28 },
    { class: 'Class 35 (Services)', count: 22 },
    { class: 'Class 42 (Software)', count: 18 },
    { class: 'Class 25 (Clothing)', count: 15 },
    { class: 'Other', count: 12 }
  ],
  competitorActivity: [
    { competitor: 'TechCorp Inc.', activity: 85, trend: 'up' },
    { competitor: 'Global Brands Ltd.', activity: 72, trend: 'down' },
    { competitor: 'Innovation Co.', activity: 68, trend: 'up' },
    { competitor: 'StartupX', activity: 45, trend: 'up' }
  ],
  predictiveInsights: [
    { prediction: 'Increased activity in Class 9 expected', probability: 85, impact: 'high' },
    { prediction: 'Competitor filing surge predicted', probability: 72, impact: 'medium' },
    { prediction: 'Domain registration conflicts likely', probability: 68, impact: 'medium' },
    { prediction: 'Opposition window closing soon', probability: 95, impact: 'high' }
  ]
};

export const TrademarkAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData>(mockAnalyticsData);
  const [selectedPeriod, setSelectedPeriod] = useState('6m');

  useEffect(() => {
    // In a real app, fetch analytics data based on selectedPeriod
    // For now, we'll use mock data
  }, [selectedPeriod]);

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