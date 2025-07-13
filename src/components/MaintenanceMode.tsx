import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useMaintenanceMode } from '@/lib/maintenance';
import { 
  Wrench, 
  Clock, 
  Shield, 
  Mail,
  Twitter,
  MessageCircle,
  Settings,
  Power
} from 'lucide-react';
import tsmoLogo from "@/assets/tsmo-transparent-logo.png";

const MaintenanceMode = () => {
  const { toggleMaintenanceMode } = useMaintenanceMode();
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleAdminAccess = () => {
    // Simple password check - in production, this should be more secure
    if (adminPassword === 'tsmo-admin-2024') {
      toggleMaintenanceMode(false);
      setAdminDialogOpen(false);
      setAdminPassword('');
      setPasswordError('');
    } else {
      setPasswordError('Invalid admin password');
    }
  };

  const handlePasswordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdminAccess();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src={tsmoLogo} 
            alt="TSMO Logo" 
            className="h-32 mx-auto object-contain opacity-80"
          />
        </div>

        {/* Main Card */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Wrench className="w-8 h-8 text-primary animate-pulse" />
              </div>
            </div>
            <Badge variant="outline" className="mx-auto mb-4 px-4 py-2">
              <Clock className="w-3 h-3 mr-2" />
              Scheduled Maintenance
            </Badge>
            <CardTitle className="text-3xl md:text-4xl font-bold mb-2">
              We'll Be Right Back
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg text-muted-foreground leading-relaxed">
              TSMO is currently undergoing scheduled maintenance to improve our art protection services. 
              We're working hard to get everything back online as quickly as possible.
            </p>

            {/* Estimated Time */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-semibold">Estimated Completion Time</span>
              </div>
              <div className="text-2xl font-bold text-primary">
                2:00 AM PST
              </div>
              <div className="text-sm text-muted-foreground">
                Maintenance window: 12:00 AM - 4:00 AM PST
              </div>
            </div>

            {/* What We're Improving */}
            <div className="text-left space-y-3">
              <h3 className="font-semibold text-center mb-4">What We're Improving</h3>
              <div className="grid gap-3">
                <div className="flex items-center space-x-3">
                  <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Enhanced AI visual recognition algorithms</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Faster blockchain verification processing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Improved monitoring dashboard performance</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">New deep web scanning capabilities</span>
                </div>
              </div>
            </div>

            {/* Admin Override */}
            <div className="border-t pt-6">
              <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary">
                    <Settings className="w-3 h-3 mr-1" />
                    Admin Access
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Power className="w-5 h-5 text-primary" />
                      Administrator Override
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Enter admin password to disable maintenance mode:
                    </p>
                    <div className="space-y-2">
                      <Input
                        type="password"
                        placeholder="Admin password"
                        value={adminPassword}
                        onChange={(e) => {
                          setAdminPassword(e.target.value);
                          setPasswordError('');
                        }}
                        onKeyPress={handlePasswordKeyPress}
                      />
                      {passwordError && (
                        <p className="text-sm text-destructive">{passwordError}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleAdminAccess}
                        className="flex-1"
                        disabled={!adminPassword}
                      >
                        <Power className="w-4 h-4 mr-2" />
                        Disable Maintenance Mode
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setAdminDialogOpen(false);
                          setAdminPassword('');
                          setPasswordError('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Contact Information */}
            <div className="border-t pt-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Need immediate assistance? Contact our emergency support:
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  emergency@tsmo.com
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Live Chat
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Twitter className="w-4 h-4" />
                  @TSMOSupport
                </Button>
              </div>
            </div>

            {/* Status Updates */}
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  Real-time Updates
                </span>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Follow us on social media or check our status page for real-time maintenance updates.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Thank you for your patience as we work to improve TSMO
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
            <span>© 2024 TSMO</span>
            <span>•</span>
            <a href="#" className="hover:text-primary transition-colors">Status Page</a>
            <span>•</span>
            <a href="#" className="hover:text-primary transition-colors">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceMode;