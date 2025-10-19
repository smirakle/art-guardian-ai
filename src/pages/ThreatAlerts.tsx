import { RealtimeThreatAlertsDashboard } from "@/components/phase5/RealtimeThreatAlertsDashboard";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BugReportButton } from "@/components/BugReportButton";

const ThreatAlerts = () => {
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  
  const isProfessionalOrHigher = subscription?.plan_id === 'professional' || subscription?.plan_id === 'enterprise';

  if (!isProfessionalOrHigher) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <CardTitle className="text-2xl">Real-time Threat Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              Get instant notifications about threats and suspicious activity with advanced monitoring.
            </p>
            <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
              <Lock className="w-4 h-4" />
              <span>Requires Professional or Enterprise plan</span>
            </div>
            <Button 
              onClick={() => navigate('/pricing')}
              className="mt-4"
            >
              Upgrade to Professional
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
        <h1 className="text-3xl font-bold mb-2">Real-time Threat Alerts</h1>
        <p className="text-muted-foreground">
          Monitor and respond to security threats in real-time
        </p>
      </div>
      <RealtimeThreatAlertsDashboard />
      <BugReportButton />
    </div>
  );
};

export default ThreatAlerts;
