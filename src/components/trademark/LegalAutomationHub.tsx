import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Scale, FileText, Clock, AlertTriangle, CheckCircle, 
  Zap, Brain, Shield, Users, Download, Send,
  Calendar, DollarSign, TrendingUp, Award
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface LegalWorkflow {
  id: string;
  workflow_type: string;
  status: string;
  current_step: string;
  priority: string;
  deadline?: string;
  workflow_metadata: any;
  created_at: string;
}

interface ComplianceItem {
  type: string;
  priority: string;
  trademark_name: string;
  deadline?: string;
  days_remaining?: number;
  action_required: string;
  estimated_cost?: string;
}

interface DocumentGeneration {
  id: string;
  template_title: string;
  generated_at: string;
  created_at: string;
  template_id: string;
  custom_fields: any;
}

export const LegalAutomationHub: React.FC = () => {
  const [workflows, setWorkflows] = useState<LegalWorkflow[]>([]);
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [documents, setDocuments] = useState<DocumentGeneration[]>([]);
  const [complianceScore, setComplianceScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [automationStats, setAutomationStats] = useState({
    documents_generated: 0,
    workflows_active: 0,
    cost_savings: 0,
    processing_time_saved: 0
  });

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchLegalData();
    }
  }, [user]);

  const fetchLegalData = async () => {
    try {
      // Fetch compliance data
      const { data: complianceData, error: complianceError } = await supabase.functions.invoke(
        'automated-legal-workflow',
        {
          body: {
            action: 'compliance_check',
            user_id: user?.id
          }
        }
      );

      if (complianceError) throw complianceError;
      
      setComplianceItems(complianceData.compliance_items || []);
      setComplianceScore(complianceData.compliance_score || 0);

      // Fetch workflows
      const { data: workflowData } = await supabase
        .from('portfolio_compliance_workflows')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      setWorkflows(workflowData || []);

      // Fetch generated documents
      const { data: docData } = await supabase
        .from('legal_document_generations')
        .select('*')
        .eq('user_id', user?.id)
        .order('generated_at', { ascending: false })
        .limit(20);

      setDocuments(docData || []);

      // Calculate automation stats
      const stats = {
        documents_generated: docData?.length || 0,
        workflows_active: workflowData?.filter(w => w.status === 'initiated' || w.status === 'in_progress').length || 0,
        cost_savings: (docData?.length || 0) * 150, // Estimated savings per document
        processing_time_saved: (docData?.length || 0) * 2 // Hours saved per document
      };
      setAutomationStats(stats);

    } catch (error) {
      console.error('Error fetching legal data:', error);
      toast({
        title: "Error",
        description: "Failed to load legal automation data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateDocuments = async (alertId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('automated-legal-workflow', {
        body: {
          action: 'generate_documents',
          user_id: user?.id,
          alert_id: alertId,
          automation_level: 'semi_automated'
        }
      });

      if (error) throw error;

      toast({
        title: "Documents Generated",
        description: `Generated ${data.documents.length} legal documents for review`,
      });

      fetchLegalData(); // Refresh data
    } catch (error) {
      console.error('Error generating documents:', error);
      toast({
        title: "Error",
        description: "Failed to generate legal documents",
        variant: "destructive"
      });
    }
  };

  const handleBulkEnforcement = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('automated-legal-workflow', {
        body: {
          action: 'bulk_enforcement',
          user_id: user?.id,
          automation_level: 'fully_automated'
        }
      });

      if (error) throw error;

      toast({
        title: "Bulk Enforcement Completed",
        description: `Processed ${data.total_processed} alerts with ${data.successful_actions} successful actions`,
      });

      fetchLegalData();
    } catch (error) {
      console.error('Error with bulk enforcement:', error);
      toast({
        title: "Error",
        description: "Failed to execute bulk enforcement",
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'initiated': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Automation Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Documents Generated</p>
                <p className="text-2xl font-bold text-primary">{automationStats.documents_generated}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Workflows</p>
                <p className="text-2xl font-bold text-blue-600">{automationStats.workflows_active}</p>
              </div>
              <Zap className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cost Savings</p>
                <p className="text-2xl font-bold text-green-600">${automationStats.cost_savings.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                <p className="text-2xl font-bold text-purple-600">{complianceScore}%</p>
              </div>
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
            <Progress value={complianceScore} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="workflows" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workflows">Active Workflows</TabsTrigger>
          <TabsTrigger value="documents">Document Center</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Hub</TabsTrigger>
          <TabsTrigger value="automation">Automation Center</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Legal Workflows
              </CardTitle>
            </CardHeader>
            <CardContent>
              {workflows.length === 0 ? (
                <div className="text-center py-8">
                  <Scale className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No active workflows</p>
                  <p className="text-sm text-muted-foreground">
                    Legal workflows will appear here when trademark conflicts require action
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {workflows.map((workflow) => (
                    <Card key={workflow.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{workflow.workflow_type.replace('_', ' ').toUpperCase()}</h4>
                              <Badge className={getPriorityColor(workflow.priority)}>
                                {workflow.priority}
                              </Badge>
                              <Badge className={getStatusColor(workflow.status)}>
                                {workflow.status}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              Current Step: {workflow.current_step.replace('_', ' ')}
                            </p>

                            {workflow.deadline && (
                              <div className="flex items-center gap-1 text-sm text-orange-600">
                                <Clock className="h-3 w-3" />
                                Deadline: {new Date(workflow.deadline).toLocaleDateString()}
                              </div>
                            )}

                            {workflow.workflow_metadata?.estimated_cost && (
                              <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                                <DollarSign className="h-3 w-3" />
                                Estimated Cost: {workflow.workflow_metadata.estimated_cost}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            <Button variant="outline" size="sm">
                              Update Status
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Generated Legal Documents
                </CardTitle>
                <Button onClick={() => handleGenerateDocuments('sample-alert')}>
                  <Brain className="h-4 w-4 mr-2" />
                  AI Generate Documents
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.map((doc) => (
                  <Card key={doc.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{doc.template_title}</h4>
                            <Badge variant="outline">{doc.template_id}</Badge>
                            <Badge className="bg-blue-100 text-blue-800">
                              Generated
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            Generated: {new Date(doc.generated_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          <Button variant="outline" size="sm">
                            <Send className="h-4 w-4 mr-1" />
                            Send
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Compliance Dashboard
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Overall Score:</span>
                  <Badge variant="outline" className="text-lg">
                    {complianceScore}%
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Progress value={complianceScore} className="h-3" />
              </div>

              {complianceItems.length === 0 ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    All compliance requirements are up to date. Great job maintaining your trademark portfolio!
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {complianceItems.map((item, index) => (
                    <Card key={index} className={`border-l-4 ${
                      item.priority === 'critical' ? 'border-l-red-500' :
                      item.priority === 'high' ? 'border-l-orange-500' :
                      'border-l-yellow-500'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{item.action_required}</h4>
                              <Badge className={getPriorityColor(item.priority)}>
                                {item.priority}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-1">
                              Trademark: {item.trademark_name}
                            </p>

                            {item.deadline && (
                              <div className="flex items-center gap-1 text-sm text-orange-600">
                                <Calendar className="h-3 w-3" />
                                Due: {new Date(item.deadline).toLocaleDateString()}
                                {item.days_remaining && (
                                  <span className="ml-1">({item.days_remaining} days remaining)</span>
                                )}
                              </div>
                            )}

                            {item.estimated_cost && (
                              <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                                <DollarSign className="h-3 w-3" />
                                {item.estimated_cost}
                              </div>
                            )}
                          </div>

                          <Button variant="outline" size="sm">
                            Take Action
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Automation Control Center
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Quick Actions</h3>
                  
                  <Button 
                    onClick={handleBulkEnforcement}
                    className="w-full justify-start h-auto p-4"
                    variant="outline"
                  >
                    <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5 text-primary" />
                      <div className="text-left">
                        <div className="font-medium">Bulk Enforcement</div>
                        <div className="text-sm text-muted-foreground">
                          Process all high-risk alerts automatically
                        </div>
                      </div>
                    </div>
                  </Button>

                  <Button 
                    className="w-full justify-start h-auto p-4"
                    variant="outline"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div className="text-left">
                        <div className="font-medium">Generate Reports</div>
                        <div className="text-sm text-muted-foreground">
                          Create comprehensive legal status reports
                        </div>
                      </div>
                    </div>
                  </Button>

                  <Button 
                    className="w-full justify-start h-auto p-4"
                    variant="outline"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-primary" />
                      <div className="text-left">
                        <div className="font-medium">Attorney Collaboration</div>
                        <div className="text-sm text-muted-foreground">
                          Share cases with legal professionals
                        </div>
                      </div>
                    </div>
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Automation Stats</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">Processing Speed</span>
                      <Badge variant="outline">95% faster</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">Accuracy Rate</span>
                      <Badge variant="outline">99.2%</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">Cost Reduction</span>
                      <Badge variant="outline">87%</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">Time Saved</span>
                      <Badge variant="outline">{automationStats.processing_time_saved}h</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LegalAutomationHub;