import { useNavigate } from 'react-router-dom';
import { Upload, Eye, Brain, Scale, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const actions = [
  {
    icon: Upload,
    label: 'Upload & Protect',
    description: 'Add new artwork',
    path: '/upload',
    gradient: 'from-primary/10 to-primary/5',
    iconColor: 'text-primary',
    borderHover: 'hover:border-primary/40',
  },
  {
    icon: Eye,
    label: 'Start Monitoring',
    description: 'Scan the web',
    path: '/monitoring-hub',
    gradient: 'from-secondary/10 to-secondary/5',
    iconColor: 'text-secondary',
    borderHover: 'hover:border-secondary/40',
  },
  {
    icon: Brain,
    label: 'AI Protection',
    description: 'Configure shields',
    path: '/protection-hub',
    gradient: 'from-purple-500/10 to-purple-500/5',
    iconColor: 'text-purple-500',
    borderHover: 'hover:border-purple-500/40',
  },
  {
    icon: Scale,
    label: 'Legal Tools',
    description: 'DMCA & templates',
    path: '/legal-templates',
    gradient: 'from-accent/10 to-accent/5',
    iconColor: 'text-accent',
    borderHover: 'hover:border-accent/40',
  },
];

export const DashboardQuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className={cn(
                'group relative flex flex-col items-start gap-3 rounded-2xl border border-border/50 p-5',
                'bg-gradient-to-br transition-all duration-300',
                'hover:shadow-md hover:-translate-y-0.5',
                action.gradient,
                action.borderHover
              )}
            >
              <div className="flex items-center justify-between w-full">
                <Icon className={cn('h-6 w-6', action.iconColor)} />
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm text-foreground">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
