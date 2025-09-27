import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Shield, 
  Activity, 
  Search, 
  Plus,
  Zap,
  ChevronDown,
  ChevronUp,
  Scale
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  showFor: string[];
}

const quickActions: QuickAction[] = [
  {
    id: 'upload',
    label: 'Upload Art',
    icon: Upload,
    path: '/upload',
    description: 'Add new artwork to protect',
    priority: 'high',
    showFor: ['/', '/dashboard', '/monitoring']
  },
  {
    id: 'protect',
    label: 'AI Protect',
    icon: Shield,
    path: '/ai-protection-settings',
    description: 'Configure AI protection',
    priority: 'high',
    showFor: ['/', '/dashboard', '/upload']
  },
  {
    id: 'monitor',
    label: 'Monitor',
    icon: Activity,
    path: '/monitoring',
    description: 'Check for violations',
    priority: 'medium',
    showFor: ['/', '/dashboard', '/upload']
  },
  {
    id: 'search',
    label: 'Deep Scan',
    icon: Search,
    path: '/deep-scan',
    description: 'Find unauthorized usage',
    priority: 'medium',
    showFor: ['/monitoring', '/dashboard']
  },
  {
    id: 'create-legal',
    label: 'Legal Action',
    icon: Scale,
    path: '/legal',
    description: 'File takedown notices',
    priority: 'low',
    showFor: ['/monitoring']
  }
];

interface QuickActionsBarProps {
  className?: string;
}

const QuickActionsBar: React.FC<QuickActionsBarProps> = ({ className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [relevantActions, setRelevantActions] = useState<QuickAction[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const currentPath = location.pathname;
    const contextualActions = quickActions.filter(action => 
      action.showFor.includes(currentPath) || action.showFor.includes('/')
    );

    // Sort by priority and limit to most relevant
    const sortedActions = contextualActions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    setRelevantActions(sortedActions.slice(0, 5));
  }, [location.pathname, user]);

  if (!user || relevantActions.length === 0) return null;

  const displayActions = isExpanded ? relevantActions : relevantActions.slice(0, 3);

  return (
    <Card className={`fixed top-20 left-4 z-30 shadow-lg bg-background/95 backdrop-blur-sm border-primary/20 ${className}`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Quick Actions</span>
          {relevantActions.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0 ml-auto"
            >
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {displayActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="ghost"
                size="sm"
                onClick={() => navigate(action.path)}
                className="w-full justify-start gap-3 h-auto p-2 hover:bg-primary/10"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
                {action.priority === 'high' && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    Hot
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>

        {isExpanded && relevantActions.length > 3 && (
          <div className="mt-3 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              See All Features
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickActionsBar;