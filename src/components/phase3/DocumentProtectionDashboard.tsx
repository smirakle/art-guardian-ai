import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Upload, FileCheck, Search } from "lucide-react";
import { DocumentUploadSection } from "./DocumentUploadSection";
import { ProtectedDocumentsList } from "./ProtectedDocumentsList";
import { DocumentMonitoringDashboard } from "./DocumentMonitoringDashboard";

export const DocumentProtectionDashboard = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">
            <Upload className="w-4 h-4 mr-2" />
            Upload & Protect
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileCheck className="w-4 h-4 mr-2" />
            Protected Documents
          </TabsTrigger>
          <TabsTrigger value="monitoring">
            <Search className="w-4 h-4 mr-2" />
            Real-time Monitoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <DocumentUploadSection />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <ProtectedDocumentsList />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <DocumentMonitoringDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};
