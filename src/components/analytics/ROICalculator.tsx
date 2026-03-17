import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Shield, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface ROIMetrics {
  subscriptionCost: number;
  threatsBlocked: number;
  potentialLoss: number;
  roiPercentage: number;
  monthlyTrend: Array<{ month: string; saved: number; cost: number }>;
}

export const ROICalculator: React.FC = () => {
  const [metrics, setMetrics] = useState<ROIMetrics>({
    subscriptionCost: 0,
    threatsBlocked: 0,
    potentialLoss: 0,
    roiPercentage: 0,
    monthlyTrend: []
  });

  useEffect(() => {
    calculateROI();
  }, []);

  const calculateROI = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get subscription cost
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_id')
      .eq('user_id', user.id)
      .single();

    const planCosts: Record<string, number> = {
      free: 0,
      student: 10,
      starter: 29,
      professional: 99,
      enterprise: 299
    };

    const monthlyCost = planCosts[subscription?.plan_id || 'free'] || 0;

    // Get threats detected
    const { data: threats } = await supabase
      .from('ai_threat_detections')
      .select('threat_level, created_at')
      .eq('user_id', user.id);

    const highThreats = threats?.filter(t => t.threat_level === 'high').length || 0;
    const mediumThreats = threats?.filter(t => t.threat_level === 'medium').length || 0;

    // Calculate potential loss prevented
    // High threat = $5000 avg, Medium = $1000 avg (industry estimates)
    const potentialLoss = (highThreats * 5000) + (mediumThreats * 1000);

    // Calculate ROI
    const roi = monthlyCost > 0 
      ? ((potentialLoss - monthlyCost) / monthlyCost) * 100 
      : 0;

    // Generate monthly trend data
    const monthlyTrend = generateMonthlyTrend(threats || [], monthlyCost);

    setMetrics({
      subscriptionCost: monthlyCost,
      threatsBlocked: threats?.length || 0,
      potentialLoss,
      roiPercentage: Math.round(roi),
      monthlyTrend
    });
  };

  const generateMonthlyTrend = (threats: any[], monthlyCost: number) => {
    // Group real threat data by month and compute actual savings per month
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result: Array<{ month: string; saved: number; cost: number }> = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = d.toISOString();
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();
      const monthThreats = threats.filter(t => t.created_at >= monthStart && t.created_at < monthEnd);
      const highCount = monthThreats.filter(t => t.threat_level === 'high').length;
      const medCount = monthThreats.filter(t => t.threat_level === 'medium').length;
      const saved = (highCount * 5000) + (medCount * 1000);
      result.push({ month: monthNames[d.getMonth()], saved, cost: monthlyCost });
    }
    return result;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Return on Investment (ROI)
          </CardTitle>
          <CardDescription>
            Track the financial impact of your AI protection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Monthly Cost</span>
              </div>
              <div className="text-2xl font-bold">${metrics.subscriptionCost}</div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Threats Blocked</span>
              </div>
              <div className="text-2xl font-bold">{metrics.threatsBlocked}</div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Loss Prevented</span>
              </div>
              <div className="text-2xl font-bold">${metrics.potentialLoss.toLocaleString()}</div>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">ROI</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {metrics.roiPercentage > 0 ? '+' : ''}{metrics.roiPercentage}%
              </div>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.monthlyTrend}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-medium mb-1">{payload[0].payload.month}</p>
                          <p className="text-sm text-green-600">
                            Saved: ${payload[0].value?.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Cost: ${payload[1].value}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="saved"
                  stackId="1"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="cost"
                  stackId="2"
                  stroke="hsl(var(--destructive))"
                  fill="hsl(var(--destructive))"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 p-4 bg-primary/5 rounded-lg">
            <h4 className="font-medium mb-2">ROI Calculation Methodology</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• High-risk threats: Estimated $5,000 potential loss per incident</li>
              <li>• Medium-risk threats: Estimated $1,000 potential loss per incident</li>
              <li>• Based on industry averages for copyright infringement damages</li>
              <li>• ROI = (Loss Prevented - Subscription Cost) / Subscription Cost × 100%</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
