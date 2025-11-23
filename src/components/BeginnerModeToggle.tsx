import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

export function BeginnerModeToggle() {
  const { interfaceMode, setInterfaceMode } = useUserPreferences();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interface Mode</CardTitle>
        <CardDescription>
          Choose between simplified or advanced interface
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="interface-mode" className="text-base font-medium">
              Advanced Mode
            </Label>
            <p className="text-sm text-muted-foreground">
              {interfaceMode === 'advanced' 
                ? 'Showing all features, analytics, and technical details'
                : 'Switch to see advanced features and detailed analytics'}
            </p>
          </div>
          <Switch
            id="interface-mode"
            checked={interfaceMode === 'advanced'}
            onCheckedChange={(checked) => setInterfaceMode(checked ? 'advanced' : 'beginner')}
          />
        </div>

        {interfaceMode === 'beginner' && (
          <div className="bg-primary/10 p-4 rounded-lg flex gap-3">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-primary mb-1">You're in Beginner Mode</p>
              <p className="text-muted-foreground">
                The interface is simplified to show only essential features. Toggle Advanced Mode 
                to access all analytics, monitoring tools, and technical features.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
