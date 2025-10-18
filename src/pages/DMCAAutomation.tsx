import { AutomatedDMCADashboard } from "@/components/phase6/AutomatedDMCADashboard";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileCheck, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BugReportButton } from "@/components/BugReportButton";

const DMCAAutomation = () => {
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  
  const isProfessionalOrHigher = subscription?.plan_id === 'professional' || subscription?.plan_id === 'enterprise';

  if (!isProfessionalOrHigher) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <FileCheck className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <CardTitle className="text-2xl">Automated DMCA Takedowns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              Automatically generate and file DMCA takedown notices for copyright violations.
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
        <h1 className="text-3xl font-bold mb-2">Automated DMCA Takedowns</h1>
        <p className="text-muted-foreground">
          Streamline copyright enforcement with automated DMCA notices
        </p>
      </div>
      <AutomatedDMCADashboard />
      <BugReportButton />
    </div>
  );
};

export default DMCAAutomation;
