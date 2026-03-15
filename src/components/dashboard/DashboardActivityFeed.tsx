import { Shield, AlertTriangle, Link2, Scale, Eye, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityItem {
  icon: string;
  message: string;
  timestamp: Date;
}

interface DashboardActivityFeedProps {
  activities: ActivityItem[];
}

const iconMap: Record<string, { icon: typeof Shield; color: string; bg: string }> = {
  shield: { icon: Shield, color: 'text-green-500', bg: 'bg-green-500/10' },
  alert: { icon: AlertTriangle, color: 'text-secondary', bg: 'bg-secondary/10' },
  link: { icon: Link2, color: 'text-primary', bg: 'bg-primary/10' },
  scale: { icon: Scale, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  eye: { icon: Eye, color: 'text-primary', bg: 'bg-primary/10' },
};

export const DashboardActivityFeed = ({ activities }: DashboardActivityFeedProps) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="rounded-full bg-muted/50 p-4 mb-3">
            <Activity className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No recent activity yet</p>
          <p className="text-xs text-muted-foreground mt-1">Upload content to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
      <div className="space-y-1">
        {activities.map((activity, index) => {
          const config = iconMap[activity.icon] || { icon: Activity, color: 'text-muted-foreground', bg: 'bg-muted/50' };
          const Icon = config.icon;
          const timeAgo = getTimeAgo(activity.timestamp);

          return (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors group"
            >
              <div className={cn('rounded-lg p-2 shrink-0', config.bg)}>
                <Icon className={cn('h-4 w-4', config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{activity.message}</p>
                <p className="text-xs text-muted-foreground">{timeAgo}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
