import { ComingSoon } from '@/components/ComingSoon';
import { FileCheck } from 'lucide-react';
import { BugReportButton } from '@/components/BugReportButton';

const DMCAAutomation = () => {
  return (
    <div className="container mx-auto p-6">
      <ComingSoon 
        title="Automated DMCA Takedowns" 
        description="Automatically generate and file DMCA takedown notices for copyright violations. Coming soon."
        icon={<FileCheck className="w-12 h-12 text-muted-foreground" />}
      />
      <BugReportButton />
    </div>
  );
};

export default DMCAAutomation;
