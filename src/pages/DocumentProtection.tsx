import { DocumentProtectionDashboard } from "@/components/phase3/DocumentProtectionDashboard";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BugReportButton } from "@/components/BugReportButton";

const DocumentProtection = () => {
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  
  const isProfessionalOrHigher = subscription?.plan_id === 'professional' || subscription?.plan_id === 'enterprise';

  if (!isProfessionalOrHigher) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <CardTitle className="text-2xl">Document Protection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              Protect your sensitive documents with advanced AI fingerprinting and tracer technology.
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
        <h1 className="text-3xl font-bold mb-2">Document Protection</h1>
        <p className="text-muted-foreground">
          Secure your documents with AI fingerprinting and monitoring
        </p>
      </div>
      <DocumentProtectionDashboard />
      <BugReportButton />
    </div>
  );
};

export default DocumentProtection;
