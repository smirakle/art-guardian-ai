import { Shield, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AIProtectionBadgeProps {
  isProtected: boolean;
  level?: 'light' | 'standard' | 'maximum';
}

export function AIProtectionBadge({ isProtected, level }: AIProtectionBadgeProps) {
  if (!isProtected) {
    return (
      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20">
        <ShieldAlert className="h-3 w-3 mr-1" />
        Not AI-Protected
      </Badge>
    );
  }

  const levelColors = {
    light: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    standard: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
    maximum: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
  };

  const levelLabels = {
    light: 'Light Protection',
    standard: 'Standard Protection',
    maximum: 'Maximum Protection',
  };

  return (
    <Badge variant="outline" className={levelColors[level || 'standard']}>
      <Shield className="h-3 w-3 mr-1" />
      {level ? levelLabels[level] : 'AI-Protected'}
    </Badge>
  );
}
