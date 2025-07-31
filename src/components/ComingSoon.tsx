import { Clock, Wrench } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

interface ComingSoonProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function ComingSoon({ 
  title = "Coming Soon", 
  description = "This feature is currently under development and will be available soon.",
  icon = <Clock className="w-12 h-12 text-muted-foreground" />
}: ComingSoonProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              {icon}
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">{title}</h3>
              <p className="text-muted-foreground text-sm">{description}</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Wrench className="w-4 h-4" />
              <span>Under Development</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}