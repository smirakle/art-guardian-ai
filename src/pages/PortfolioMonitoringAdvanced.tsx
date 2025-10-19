import { PortfolioMonitoringDashboard } from "@/components/phase4/PortfolioMonitoringDashboard";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderSearch, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BugReportButton } from "@/components/BugReportButton";

const PortfolioMonitoringAdvanced = () => {
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  
  const hasAccess = ['starter', 'professional', 'enterprise'].includes(subscription?.plan_id || '');

  if (!hasAccess) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <FolderSearch className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <CardTitle className="text-2xl">Advanced Portfolio Monitoring</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              Monitor your entire portfolio across multiple platforms with advanced scanning and analytics.
            </p>
            <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
              <Lock className="w-4 h-4" />
              <span>Requires Starter, Professional, or Enterprise plan</span>
            </div>
            <Button 
              onClick={() => navigate('/pricing')}
              className="mt-4"
            >
              Upgrade Your Plan
            </Button>
          </CardContent>
        </Card>
        <BugReportButton />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Advanced Portfolio Monitoring</h1>
        <p className="text-muted-foreground">
          Comprehensive monitoring and scanning across all platforms
        </p>
      </div>
      <PortfolioMonitoringDashboard />
      <BugReportButton />
    </div>
  );
};

export default PortfolioMonitoringAdvanced;
