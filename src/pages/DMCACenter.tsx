import { ComingSoon } from "@/components/ComingSoon";
import { Gavel } from "lucide-react";

export default function DMCACenter() {
  return (
    <ComingSoon 
      title="DMCA Center"
      description="Advanced DMCA takedown notice management and tracking features are currently under development."
      icon={<Gavel className="w-12 h-12 text-muted-foreground" />}
    />
  );
}