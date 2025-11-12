import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Shield, Download, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface ProtectionRecord {
  id: string;
  original_filename: string;
  protection_level: string;
  created_at: string;
  protection_id: string;
  file_fingerprint: string;
  document_methods: any;
}

export const ProtectedDocumentsList = () => {
  const [documents, setDocuments] = useState<ProtectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("ai_protection_records")
        .select("*")
        .eq("user_id", user.id)
        .eq("content_type", "document")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setDocuments(data || []);
    } catch (error: any) {
      console.error("Error loading documents:", error);
      toast({
        title: "Error",
        description: "Failed to load protected documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getProtectionColor = (level: string) => {
    switch (level) {
      case "maximum": return "bg-green-500";
      case "standard": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getProtectionBadge = (level: string) => {
    switch (level) {
      case "maximum": return "default";
      case "standard": return "secondary";
      default: return "outline";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Protected Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Protected Documents ({documents.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No protected documents yet. Upload a document to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="border-l-4" style={{
                borderLeftColor: doc.protection_level === "maximum" ? "rgb(34 197 94)" :
                                 doc.protection_level === "standard" ? "rgb(59 130 246)" :
                                 "rgb(107 114 128)"
              }}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <p className="font-medium">{doc.original_filename}</p>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getProtectionBadge(doc.protection_level)} className="capitalize">
                          {doc.protection_level}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Protected on {new Date(doc.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ID: {doc.protection_id}
                      </p>
                      {doc.document_methods && Array.isArray(doc.document_methods) && doc.document_methods.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {doc.document_methods.map((method: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {method}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
