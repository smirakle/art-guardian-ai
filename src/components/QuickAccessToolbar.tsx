import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Eye, 
  HelpCircle, 
  MessageSquare, 
  Zap,
  ChevronUp,
  ChevronDown,
  Home,
  Settings,
  FileText
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  action: () => void;
  badge?: string;
  color?: string;
  requiresAuth?: boolean;
}

const QuickAccessToolbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const quickActions: QuickAction[] = [
    {
      id: 'upload',
      label: 'Quick Upload',
      icon: Upload,
      action: () => navigate('/upload'),
      color: 'bg-blue-500 hover:bg-blue-600',
      requiresAuth: false
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      action: () => navigate('/dashboard'),
      color: 'bg-green-500 hover:bg-green-600',
      requiresAuth: true
    },
    {
      id: 'monitoring',
      label: 'Monitoring Hub',
      icon: Eye,
      action: () => navigate('/monitoring-hub'),
      badge: 'Live',
      color: 'bg-purple-500 hover:bg-purple-600',
      requiresAuth: true
    },
    {
      id: 'protection',
      label: 'Protection Hub',
      icon: Zap,
      action: () => navigate('/protection-hub'),
      color: 'bg-red-500 hover:bg-red-600',
      requiresAuth: true
    },
    {
      id: 'help',
      label: 'Help Center',
      icon: HelpCircle,
      action: () => navigate('/faq'),
      color: 'bg-orange-500 hover:bg-orange-600',
      requiresAuth: false
    },
    {
      id: 'contact',
      label: 'Support',
      icon: MessageSquare,
      action: () => navigate('/contact'),
      color: 'bg-teal-500 hover:bg-teal-600',
      requiresAuth: false
    }
  ];

  // Filter actions based on auth status
  const availableActions = quickActions.filter(action => 
    !action.requiresAuth || (action.requiresAuth && user)
  );

  // Don't show on auth page
  if (location.pathname === '/auth') {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-40">
        <Card className="shadow-lg border-2 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-2">
            {!isCollapsed && (
              <div className="space-y-2 mb-2">
                {availableActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Tooltip key={action.id}>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          onClick={action.action}
                          className={`w-full justify-start gap-2 ${action.color || 'bg-primary hover:bg-primary/90'} text-white`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-xs">{action.label}</span>
                          {action.badge && (
                            <Badge variant="secondary" className="ml-auto text-xs">
                              {action.badge}
                            </Badge>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>{action.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
                
                {/* Quick Actions Separator */}
                <div className="border-t pt-2">
                  <div className="flex gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate('/legal-templates')}
                          className="flex-1"
                        >
                          <FileText className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>Legal Templates</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    {user && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate('/dashboard')}
                          className="flex-1"
                        >
                            <Settings className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <p>Settings</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Collapse/Expand Button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full justify-center"
            >
              {isCollapsed ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  <span className="text-xs">Quick Actions</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  <span className="text-xs">Collapse</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default QuickAccessToolbar;