import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

export function BeginnerModeToggle() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Interface</CardTitle>
        <CardDescription>
          Your interface shows essential features by default. Advanced analytics are available via expandable sections on each page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-primary/10 p-4 rounded-lg flex gap-3">
          <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-primary mb-1">Progressive Disclosure</p>
            <p className="text-muted-foreground">
              Core features are always visible. Look for "Show Advanced" buttons on pages like Dashboard and Monitoring to access detailed analytics and technical tools.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
