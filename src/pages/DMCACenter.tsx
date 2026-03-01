import { ComingSoon } from '@/components/ComingSoon';
import { Gavel } from 'lucide-react';
import { BugReportButton } from '@/components/BugReportButton';

export default function DMCACenter() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ComingSoon 
        title="DMCA Center" 
        description="Real-time violation tracking and automated DMCA takedown management is coming soon."
        icon={<Gavel className="w-12 h-12 text-muted-foreground" />}
      />
      <BugReportButton />
    </div>
  );
}
