import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Upload, FileCheck, Search, GitCompare, Settings, ShieldCheck } from "lucide-react";
import { DocumentUploadSection } from "./DocumentUploadSection";
import { ProtectedDocumentsList } from "./ProtectedDocumentsList";
import { DocumentMonitoringDashboard } from "./DocumentMonitoringDashboard";
import { DocumentVersionComparison } from "./DocumentVersionComparison";
import { CopyscapeApiStatus } from "./CopyscapeApiStatus";
import { ScreenshotProtectionSettings } from "../protection/ScreenshotProtectionSettings";

export const DocumentProtectionDashboard = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
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
          <TabsTrigger value="comparison">
            <GitCompare className="w-4 h-4 mr-2" />
            Version Comparison
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            API Settings
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

        <TabsContent value="comparison" className="space-y-4">
          <DocumentVersionComparison />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <CopyscapeApiStatus />
        </TabsContent>
      </Tabs>
    </div>
  );
};
