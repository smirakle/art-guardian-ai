import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Lock } from 'lucide-react';

export function BeginnerModeToggle() {
  const { interfaceMode, setInterfaceMode, isAdmin, isLoadingRole } = useUserPreferences();

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
            <Label htmlFor="interface-mode" className="text-base font-medium flex items-center gap-2">
              Advanced Mode
              {!isAdmin && <Lock className="h-4 w-4 text-muted-foreground" />}
            </Label>
            <p className="text-sm text-muted-foreground">
              {isAdmin 
                ? (interfaceMode === 'advanced' 
                  ? 'Showing all features, analytics, and technical details'
                  : 'Switch to see advanced features and detailed analytics')
                : 'Advanced mode is restricted to administrators only'}
            </p>
          </div>
          <Switch
            id="interface-mode"
            checked={interfaceMode === 'advanced'}
            onCheckedChange={(checked) => setInterfaceMode(checked ? 'advanced' : 'beginner')}
            disabled={isLoadingRole || !isAdmin}
          />
        </div>

        {interfaceMode === 'beginner' && (
          <div className="bg-primary/10 p-4 rounded-lg flex gap-3">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-primary mb-1">You're in Beginner Mode</p>
              <p className="text-muted-foreground">
                {isAdmin 
                  ? 'The interface is simplified to show only essential features. Toggle Advanced Mode to access all analytics, monitoring tools, and technical features.'
                  : 'The interface is simplified to show only essential features. Advanced mode requires administrator permissions.'}
              </p>
            </div>
          </div>
        )}

        {!isAdmin && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg flex gap-3">
            <Lock className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-700 dark:text-yellow-600 mb-1">Admin Access Required</p>
              <p className="text-muted-foreground">
                Advanced mode is restricted to administrators for security and complexity management. 
                Contact your administrator if you need access to advanced features.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
