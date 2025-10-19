import ProductionLegalTemplates from '@/components/enhanced/ProductionLegalTemplates';
import LegalTemplateAnalytics from '@/components/enhanced/LegalTemplateAnalytics';
import LegalNotificationCenter from '@/components/enhanced/LegalNotificationCenter';
import ComplianceReminders from '@/components/enhanced/ComplianceReminders';
import GovernmentFilingService from '@/components/enhanced/GovernmentFilingService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { BugReportButton } from '@/components/BugReportButton';

const LegalTemplatesPage = () => {
  const [userSubscription, setUserSubscription] = useState<any>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { data } = await supabase
          .from('subscriptions')
          .select('plan_id')
          .eq('status', 'active')
          .single();
        setUserSubscription(data);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      }
    };
    fetchSubscription();
  }, []);

  return (
    <div className="min-h-screen pt-32 pb-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="filing">Government Filing</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="templates">
            <ProductionLegalTemplates />
          </TabsContent>
          
          <TabsContent value="filing">
            <GovernmentFilingService userSubscription={userSubscription} />
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
      <BugReportButton />
    </div>
  );
};

export default LegalTemplatesPage;