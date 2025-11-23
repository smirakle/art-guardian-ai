import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BeginnerModeToggle } from '@/components/BeginnerModeToggle';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your preferences and account settings</p>
        </div>
      </div>

      <BeginnerModeToggle />

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            View and manage your account details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Additional account settings coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
