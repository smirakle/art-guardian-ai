import ProductionLegalTemplates from '@/components/enhanced/ProductionLegalTemplates';
import LegalTemplateAnalytics from '@/components/enhanced/LegalTemplateAnalytics';
import LegalNotificationCenter from '@/components/enhanced/LegalNotificationCenter';
import ComplianceReminders from '@/components/enhanced/ComplianceReminders';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const LegalTemplatesPage = () => {
  return (
    <div className="min-h-screen pt-32 pb-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="templates">
            <ProductionLegalTemplates />
          </TabsContent>
          
          <TabsContent value="analytics">
            <LegalTemplateAnalytics />
          </TabsContent>
          
          <TabsContent value="notifications">
            <LegalNotificationCenter />
          </TabsContent>
          
          <TabsContent value="compliance">
            <ComplianceReminders />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LegalTemplatesPage;