import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Beaker, 
  X, 
  Shield, 
  Users, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  Mail
} from "lucide-react";

export default function BetaStatusBanner() {
  const [isMinimized, setIsMinimized] = useState(false);

  if (isMinimized) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMinimized(false)}
          className="bg-beta-primary/10 border-beta-primary text-beta-primary hover:bg-beta-primary/20"
        >
          <Beaker className="w-4 h-4 mr-2" />
          Beta
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-beta-gradient border-b border-beta-primary/20 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-beta-primary/20 flex items-center justify-center">
                <Beaker className="w-4 h-4 text-beta-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-beta-primary/10 text-beta-primary border-beta-primary">
                    Production Beta
                  </Badge>
                  <span className="text-sm font-medium">TSMO Watch</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Phase 2 & 3 Active • Phase 1 Coming Soon • Enterprise Security
                </p>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Blockchain Registry</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Legal Network</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Multi-Modal AI</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-orange-600" />
                <span>Core Protection Soon</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline"
                className="text-xs border-beta-primary/30 hover:bg-beta-primary/10"
                onClick={() => window.open('mailto:feedback@tsmowatch.com', '_blank')}
              >
                <Mail className="w-3 h-3 mr-1" />
                Feedback
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(true)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile layout */}
        <div className="md:hidden mt-2 pt-2 border-t border-beta-primary/20">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Blockchain</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Legal</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Multi-Modal</span>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              className="text-xs border-beta-primary/30 hover:bg-beta-primary/10"
              onClick={() => window.open('mailto:feedback@tsmowatch.com', '_blank')}
            >
              <Mail className="w-3 h-3 mr-1" />
              Feedback
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        .bg-beta-gradient {
          background: linear-gradient(135deg, 
            hsl(var(--background)) 0%, 
            hsl(var(--primary) / 0.05) 50%, 
            hsl(var(--background)) 100%);
        }
      `}</style>
    </div>
  );
}