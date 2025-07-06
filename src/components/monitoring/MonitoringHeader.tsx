import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

interface MonitoringHeaderProps {
  isMonitoring: boolean;
  onToggleMonitoring: () => void;
}

const MonitoringHeader = ({ isMonitoring, onToggleMonitoring }: MonitoringHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          24/7 Monitoring Platform
        </h1>
        <p className="text-muted-foreground mt-2">
          Real-time protection and threat detection for your creative assets
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Badge variant={isMonitoring ? "default" : "destructive"} className="px-4 py-2">
          <Activity className="w-4 h-4 mr-2" />
          {isMonitoring ? "ACTIVE" : "PAUSED"}
        </Badge>
        <Button 
          onClick={onToggleMonitoring}
          variant={isMonitoring ? "destructive" : "default"}
        >
          {isMonitoring ? "Pause Monitoring" : "Resume Monitoring"}
        </Button>
      </div>
    </div>
  );
};

export default MonitoringHeader;