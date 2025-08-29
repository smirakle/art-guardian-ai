import React, { useState } from 'react';
import { Download, FileText, Users, Scale, Search, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import InventorInformationForm from '@/components/patent/InventorInformationForm';
import PriorArtCollector from '@/components/patent/PriorArtCollector';
import PatentClaimsEditor from '@/components/patent/PatentClaimsEditor';
import USPTOFormsGenerator from '@/components/patent/USPTOFormsGenerator';
import { InventorInfo, PriorArt, PatentClaim, ApplicationInfo } from '@/types/patent';

const AttorneyPacket = () => {
  const [inventors, setInventors] = useState<InventorInfo[]>([]);
  const [priorArt, setPriorArt] = useState<PriorArt[]>([]);
  const [claims, setClaims] = useState<PatentClaim[]>([]);
  const [applicationInfo, setApplicationInfo] = useState({
    title: 'System and Method for Real-Time AI Training Dataset Monitoring and Protection',
    inventionType: 'utility',
    filingType: 'provisional',
    applicationEntity: 'small',
    assigneeCompany: 'TSMO AI Protection Systems',
    priorityClaim: '',
    crossReference: ''
  });

  const generateProvisionalPacket = () => {
    // Implementation for provisional patent packet generation
    console.log('Generating provisional patent packet...');
  };

  const generateUtilityPacket = () => {
    // Implementation for utility patent packet generation
    console.log('Generating utility patent packet...');
  };

  const generateUSPTOForms = () => {
    // Implementation for USPTO forms generation
    console.log('Generating USPTO forms...');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Patent Attorney Packet Generator</h1>
          <p className="text-muted-foreground">
            Generate USPTO-compliant patent application documents ready for attorney review and filing
          </p>
        </div>

        <Tabs defaultValue="application-info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="application-info">Application Info</TabsTrigger>
            <TabsTrigger value="inventors">Inventors</TabsTrigger>
            <TabsTrigger value="prior-art">Prior Art</TabsTrigger>
            <TabsTrigger value="claims">Claims</TabsTrigger>
            <TabsTrigger value="specification">Specification</TabsTrigger>
            <TabsTrigger value="generate">Generate</TabsTrigger>
          </TabsList>

          <TabsContent value="application-info" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Application Information
                </CardTitle>
                <CardDescription>
                  Basic information about your patent application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Invention Title</Label>
                    <Input
                      id="title"
                      value={applicationInfo.title}
                      onChange={(e) => setApplicationInfo({...applicationInfo, title: e.target.value})}
                      placeholder="Enter invention title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="invention-type">Invention Type</Label>
                    <Select value={applicationInfo.inventionType} onValueChange={(value) => setApplicationInfo({...applicationInfo, inventionType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select invention type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utility">Utility Patent</SelectItem>
                        <SelectItem value="design">Design Patent</SelectItem>
                        <SelectItem value="plant">Plant Patent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="filing-type">Filing Type</Label>
                    <Select value={applicationInfo.filingType} onValueChange={(value) => setApplicationInfo({...applicationInfo, filingType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select filing type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="provisional">Provisional Application</SelectItem>
                        <SelectItem value="nonprovisional">Non-Provisional Application</SelectItem>
                        <SelectItem value="continuation">Continuation Application</SelectItem>
                        <SelectItem value="divisional">Divisional Application</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="entity-size">Application Entity</Label>
                    <Select value={applicationInfo.applicationEntity} onValueChange={(value) => setApplicationInfo({...applicationInfo, applicationEntity: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select entity size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="micro">Micro Entity</SelectItem>
                        <SelectItem value="small">Small Entity</SelectItem>
                        <SelectItem value="large">Large Entity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assignee">Assignee Company</Label>
                    <Input
                      id="assignee"
                      value={applicationInfo.assigneeCompany}
                      onChange={(e) => setApplicationInfo({...applicationInfo, assigneeCompany: e.target.value})}
                      placeholder="Enter assignee company name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority Claim</Label>
                    <Input
                      id="priority"
                      value={applicationInfo.priorityClaim}
                      onChange={(e) => setApplicationInfo({...applicationInfo, priorityClaim: e.target.value})}
                      placeholder="Previous application number (if any)"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cross-reference">Cross-Reference to Related Applications</Label>
                  <Textarea
                    id="cross-reference"
                    value={applicationInfo.crossReference}
                    onChange={(e) => setApplicationInfo({...applicationInfo, crossReference: e.target.value})}
                    placeholder="Enter any related applications or provisional filings"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventors" className="space-y-6">
            <InventorInformationForm
              inventors={inventors}
              onInventorsChange={setInventors}
            />
          </TabsContent>

          <TabsContent value="prior-art" className="space-y-6">
            <PriorArtCollector
              priorArt={priorArt}
              onPriorArtChange={setPriorArt}
            />
          </TabsContent>

          <TabsContent value="claims" className="space-y-6">
            <PatentClaimsEditor
              claims={claims}
              onClaimsChange={setClaims}
            />
          </TabsContent>

          <TabsContent value="specification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Patent Specification</CardTitle>
                <CardDescription>
                  Technical description and detailed specification of your invention
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Current Specification Status</h4>
                  <div className="space-y-2 text-sm text-blue-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Technical background and problem statement
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Detailed system architecture
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Core algorithms and mathematical frameworks
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Implementation examples
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Field of the Invention</h4>
                    <p className="text-sm text-muted-foreground">
                      Computer systems and methods for protecting digital content from unauthorized use in artificial intelligence training datasets through real-time monitoring, advanced fingerprinting, and automated enforcement.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Background of the Invention</h4>
                    <p className="text-sm text-muted-foreground">
                      Current copyright protection systems cannot detect when digital content is used in AI training datasets, leaving creators without recourse when their work is incorporated into AI models without permission.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Summary of the Invention</h4>
                    <p className="text-sm text-muted-foreground">
                      A comprehensive system that combines advanced image fingerprinting, real-time dataset monitoring, blockchain verification, and automated legal enforcement to protect digital content from unauthorized AI training use.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generate" className="space-y-6">
            <USPTOFormsGenerator
              applicationInfo={applicationInfo}
              inventors={inventors}
              priorArt={priorArt}
              claims={claims}
              onGenerateProvisional={generateProvisionalPacket}
              onGenerateUtility={generateUtilityPacket}
              onGenerateUSPTOForms={generateUSPTOForms}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AttorneyPacket;