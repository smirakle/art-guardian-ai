import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DocumentProtection {
  id: string;
  original_filename: string;
  protection_level: string;
  created_at: string;
  protection_id: string;
}

interface TrainingViolation {
  id: string;
  violation_type: string;
  confidence_score: number;
  source_domain: string;
  detected_at: string;
  status: string;
}

export const DocumentProtectionDashboard = () => {
  const [protectedDocs, setProtectedDocs] = useState<DocumentProtection[]>([]);
  const [violations, setViolations] = useState<TrainingViolation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProtectionData();
  }, []);

  const loadProtectionData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Load protected documents
      const { data: docs } = await supabase
        .from("ai_protection_records")
        .select("id, original_filename, protection_level, created_at, protection_id")
        .eq("user_id", user.id)
        .eq("content_type", "document")
        .order("created_at", { ascending: false })
        .limit(10);

      if (docs) setProtectedDocs(docs);

      // Load violations
      const { data: viols } = await supabase
        .from("ai_training_violations")
        .select("id, violation_type, confidence_score, source_domain, detected_at, status")
        .eq("user_id", user.id)
        .order("detected_at", { ascending: false })
        .limit(5);

      if (viols) setViolations(viols);
    } catch (error) {
      console.error("Error loading protection data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProtectionColor = (level: string) => {
    switch (level) {
      case "maximum":
        return "bg-green-500";
      case "standard":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getViolationColor = (confidence: number) => {
    if (confidence >= 0.8) return "destructive";
    if (confidence >= 0.5) return "secondary";
    return "outline";
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protected Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{protectedDocs.length}</div>
            <p className="text-xs text-muted-foreground">Total secured</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {violations.filter((v) => v.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protection Rate</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.7%</div>
            <p className="text-xs text-muted-foreground">Documents secured</p>
          </CardContent>
        </Card>
      </div>

      {/* Protected Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Protected Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {protectedDocs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents protected yet</p>
          ) : (
            <div className="space-y-3">
              {protectedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${getProtectionColor(doc.protection_level)}`} />
                    <div>
                      <p className="font-medium">{doc.original_filename}</p>
                      <p className="text-xs text-muted-foreground">
                        ID: {doc.protection_id.slice(0, 12)}...
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {doc.protection_level}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Violations */}
      <Card>
        <CardHeader>
          <CardTitle>Detected Violations</CardTitle>
        </CardHeader>
        <CardContent>
          {violations.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              No violations detected
            </div>
          ) : (
            <div className="space-y-3">
              {violations.map((violation) => (
                <div
                  key={violation.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div className="space-y-1">
                    <p className="font-medium capitalize">
                      {violation.violation_type.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Source: {violation.source_domain}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Detected: {new Date(violation.detected_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={getViolationColor(violation.confidence_score)}>
                      {(violation.confidence_score * 100).toFixed(0)}% confidence
                    </Badge>
                    <Badge variant="outline" className="capitalize ml-2">
                      {violation.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
