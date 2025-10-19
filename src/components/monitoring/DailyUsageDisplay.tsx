import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useDailyApiLimit, DAILY_LIMITS } from '@/hooks/useDailyApiLimit';
import { Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface UsageStat {
  service_type: string;
  current_usage: number;
  daily_limit: number;
  remaining: number;
  reset_time: string;
}

export const DailyUsageDisplay = () => {
  const { getDailyUsageStats } = useDailyApiLimit();
  const [stats, setStats] = useState<UsageStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const data = await getDailyUsageStats();
    if (data) {
      setStats(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">Loading usage statistics...</p>
      </Card>
    );
  }

  if (stats.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">No API usage today</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Daily API Usage</h3>
      {stats.map((stat) => {
        const percentage = (stat.current_usage / stat.daily_limit) * 100;
        const isNearLimit = percentage >= 90;
        const isAtLimit = stat.remaining === 0;

        return (
          <Card key={stat.service_type} className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium capitalize">{stat.service_type.replace('_', ' ')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {stat.current_usage} / {stat.daily_limit} requests used
                  </p>
                </div>
                {isAtLimit && (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                )}
              </div>

              <div className="relative">
                <Progress 
                  value={percentage} 
                  className="h-2"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className={isAtLimit ? "text-destructive font-medium" : "text-muted-foreground"}>
                  {stat.remaining} requests remaining
                </span>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Resets {format(new Date(stat.reset_time), 'h:mm a')}</span>
                </div>
              </div>

              {isAtLimit && (
                <p className="text-sm text-destructive">
                  Daily limit reached. Service will resume tomorrow.
                </p>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};
