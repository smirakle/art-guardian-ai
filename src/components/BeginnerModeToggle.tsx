import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, BarChart3, Eye, Shield } from 'lucide-react';

export function BeginnerModeToggle() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          Progressive Disclosure
        </CardTitle>
        <CardDescription>
          Essential features are always visible. Advanced tools are one click away.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {[
            {
              icon: Shield,
              title: 'Dashboard',
              desc: 'Expand "Advanced Analytics" for threat radar, activity feed, and detailed stats.',
            },
            {
              icon: BarChart3,
              title: 'Monitoring Hub',
              desc: 'Expand "Advanced Diagnostics" for resolution metrics and detailed scan data.',
            },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
              <item.icon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 rounded-lg p-3 border border-primary/10">
          <ChevronDown className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <span>Look for <strong className="text-foreground">"Show Advanced"</strong> buttons throughout the app to reveal detailed tools.</span>
        </div>
      </CardContent>
    </Card>
  );
}
