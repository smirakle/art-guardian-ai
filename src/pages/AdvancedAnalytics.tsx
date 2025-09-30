import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROICalculator } from '@/components/analytics/ROICalculator';
import { APIDocumentationPlayground } from '@/components/api/APIDocumentationPlayground';
import { TrendingUp, Code, DollarSign } from 'lucide-react';

export default function AdvancedAnalytics() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Advanced Analytics & API</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Track your ROI, integrate with your systems, and leverage our powerful API
        </p>
      </div>

      <Tabs defaultValue="roi" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roi" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            ROI Analytics
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            API Playground
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roi" className="space-y-6">
          <ROICalculator />
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <APIDocumentationPlayground />
        </TabsContent>
      </Tabs>
    </div>
  );
}
