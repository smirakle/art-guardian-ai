import { useArtworkLimit } from '@/hooks/useArtworkLimit';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ArtworkLimitIndicatorProps {
  className?: string;
  showUpgradeLink?: boolean;
}

export const ArtworkLimitIndicator = ({ 
  className = '', 
  showUpgradeLink = true 
}: ArtworkLimitIndicatorProps) => {
  const { currentCount, artworkLimit, remainingSlots, canUpload, isLoading, message } = useArtworkLimit();

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 text-muted-foreground ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading usage...</span>
      </div>
    );
  }

  // Admin or unlimited
  if (artworkLimit === -1) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <CheckCircle className="h-4 w-4 text-green-500" />
        <span className="text-sm text-muted-foreground">Unlimited uploads</span>
      </div>
    );
  }

  // No subscription
  if (artworkLimit === 0) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center gap-2 text-amber-500">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">Subscription required</span>
        </div>
        {showUpgradeLink && (
          <Link to="/pricing">
            <Button variant="outline" size="sm">View Plans</Button>
          </Link>
        )}
      </div>
    );
  }

  const usagePercent = Math.min(100, (currentCount / artworkLimit) * 100);
  const isNearLimit = usagePercent >= 80;
  const isAtLimit = !canUpload;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Artwork Usage</span>
        <Badge variant={isAtLimit ? "destructive" : isNearLimit ? "secondary" : "outline"}>
          {currentCount.toLocaleString()} / {artworkLimit.toLocaleString()}
        </Badge>
      </div>
      
      <Progress 
        value={usagePercent} 
        className={`h-2 ${isAtLimit ? '[&>div]:bg-destructive' : isNearLimit ? '[&>div]:bg-amber-500' : ''}`}
      />
      
      <div className="flex items-center justify-between">
        <span className={`text-xs ${isAtLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
          {remainingSlots.toLocaleString()} uploads remaining
        </span>
        
        {isNearLimit && showUpgradeLink && (
          <Link to="/pricing">
            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
              Upgrade for more
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
