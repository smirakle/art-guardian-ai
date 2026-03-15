import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface PremiumStatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  trend?: string;
  trendUp?: boolean;
  accentColor: 'primary' | 'secondary' | 'accent' | 'green' | 'purple';
  className?: string;
}

const accentStyles = {
  primary: {
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    glowColor: 'shadow-primary/5',
    border: 'hover:border-primary/30',
  },
  secondary: {
    iconBg: 'bg-secondary/10',
    iconColor: 'text-secondary',
    glowColor: 'shadow-secondary/5',
    border: 'hover:border-secondary/30',
  },
  accent: {
    iconBg: 'bg-accent/10',
    iconColor: 'text-accent',
    glowColor: 'shadow-accent/5',
    border: 'hover:border-accent/30',
  },
  green: {
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-500',
    glowColor: 'shadow-green-500/5',
    border: 'hover:border-green-500/30',
  },
  purple: {
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
    glowColor: 'shadow-purple-500/5',
    border: 'hover:border-purple-500/30',
  },
};

export const PremiumStatCard = ({
  icon: Icon,
  value,
  label,
  trend,
  trendUp,
  accentColor,
  className,
}: PremiumStatCardProps) => {
  const styles = accentStyles[accentColor];

  return (
    <div
      className={cn(
        'group relative rounded-2xl border border-border/50 bg-card p-5 transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-0.5',
        styles.border,
        styles.glowColor,
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn('rounded-xl p-2.5', styles.iconBg)}>
          <Icon className={cn('h-5 w-5', styles.iconColor)} />
        </div>
        {trend && (
          <span
            className={cn(
              'text-xs font-semibold px-2 py-0.5 rounded-full',
              trendUp
                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                : 'bg-accent/10 text-accent'
            )}
          >
            {trend}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-foreground tracking-tight">{value}</div>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
};
