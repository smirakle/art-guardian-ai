import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, ArrowRight, Shield, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Success = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const sessionIdParam = searchParams.get('session_id');
    if (sessionIdParam) {
      setSessionId(sessionIdParam);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center py-12">
      <div className="container mx-auto px-6 max-w-2xl">
        <Card className="text-center bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-4">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-foreground mb-2">
              Payment Successful!
            </CardTitle>
            <CardDescription className="text-lg">
              Welcome to TSMO! Your subscription is now active.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {sessionId && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Session ID: <span className="font-mono text-xs">{sessionId}</span>
                </p>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">What's Next?</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                  <Upload className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div className="text-left">
                    <h4 className="font-semibold">Upload Your Artwork</h4>
                    <p className="text-sm text-muted-foreground">Start protecting your creative work</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                  <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div className="text-left">
                    <h4 className="font-semibold">Monitor Protection</h4>
                    <p className="text-sm text-muted-foreground">Track your copyright monitoring</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-muted-foreground">
                Your copyright protection is now active. You'll receive email confirmations and can manage 
                your subscription at any time through your account dashboard.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/upload')}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  Start Uploading <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/monitoring')}
                >
                  View Dashboard
                </Button>
              </div>
            </div>

            <div className="pt-6 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Need help? <a href="mailto:support@tsmo.com" className="text-primary hover:underline">Contact Support</a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Success;