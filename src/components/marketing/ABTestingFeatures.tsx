import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlaskConical, Target, TrendingUp, Users, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ABTest {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'completed';
  testType: 'subject' | 'content' | 'sender' | 'send_time';
  variantA: any;
  variantB: any;
  splitPercentage: number;
  sampleSize: number;
  duration: number;
  results?: {
    variantA: { sent: number; opened: number; clicked: number };
    variantB: { sent: number; opened: number; clicked: number };
    winner?: 'A' | 'B';
    confidence: number;
  };
  createdAt: string;
}

interface ABTestingFeaturesProps {
  onCreateTest?: (testData: any) => void;
}

export const ABTestingFeatures: React.FC<ABTestingFeaturesProps> = ({ onCreateTest }) => {
  const [tests, setTests] = useState<ABTest[]>([
    {
      id: '1',
      name: 'Welcome Email Subject Test',
      status: 'completed',
      testType: 'subject',
      variantA: { subject: 'Welcome to TSMO!' },
      variantB: { subject: 'Your TSMO journey begins now' },
      splitPercentage: 50,
      sampleSize: 1000,
      duration: 24,
      results: {
        variantA: { sent: 500, opened: 175, clicked: 35 },
        variantB: { sent: 500, opened: 195, clicked: 42 },
        winner: 'B',
        confidence: 95
      },
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Newsletter Content Test',
      status: 'running',
      testType: 'content',
      variantA: { content: 'Short format content' },
      variantB: { content: 'Detailed format content' },
      splitPercentage: 30,
      sampleSize: 800,
      duration: 48,
      createdAt: '2024-01-20'
    }
  ]);

  const [newTest, setNewTest] = useState({
    name: '',
    testType: 'subject',
    variantA: { subject: '', content: '', sender: '', sendTime: '' },
    variantB: { subject: '', content: '', sender: '', sendTime: '' },
    splitPercentage: 50,
    sampleSize: 1000,
    duration: 24
  });

  const { toast } = useToast();

  const handleCreateTest = () => {
    if (!newTest.name || !newTest.variantA.subject || !newTest.variantB.subject) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const test: ABTest = {
      id: Date.now().toString(),
      name: newTest.name,
      status: 'draft',
      testType: newTest.testType as any,
      variantA: newTest.variantA,
      variantB: newTest.variantB,
      splitPercentage: newTest.splitPercentage,
      sampleSize: newTest.sampleSize,
      duration: newTest.duration,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setTests(prev => [test, ...prev]);
    
    // Reset form
    setNewTest({
      name: '',
      testType: 'subject',
      variantA: { subject: '', content: '', sender: '', sendTime: '' },
      variantB: { subject: '', content: '', sender: '', sendTime: '' },
      splitPercentage: 50,
      sampleSize: 1000,
      duration: 24
    });

    if (onCreateTest) {
      onCreateTest(test);
    }

    toast({
      title: "A/B Test Created",
      description: "Your test has been created and saved as draft.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'default';
      case 'completed': return 'secondary';
      default: return 'outline';
    }
  };

  const calculateWinner = (results: ABTest['results']) => {
    if (!results) return null;
    
    const openRateA = (results.variantA.opened / results.variantA.sent) * 100;
    const openRateB = (results.variantB.opened / results.variantB.sent) * 100;
    
    return {
      winner: results.winner,
      openRateA: openRateA.toFixed(1),
      openRateB: openRateB.toFixed(1),
      improvement: Math.abs(openRateA - openRateB).toFixed(1)
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">A/B Testing</h3>
        <p className="text-muted-foreground">
          Test different versions of your emails to optimize performance
        </p>
      </div>

      <Tabs defaultValue="tests" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tests">
            <FlaskConical className="w-4 h-4 mr-2" />
            Tests
          </TabsTrigger>
          <TabsTrigger value="create">
            <Target className="w-4 h-4 mr-2" />
            Create Test
          </TabsTrigger>
          <TabsTrigger value="insights">
            <TrendingUp className="w-4 h-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-4">
          {tests.map(test => {
            const winner = calculateWinner(test.results);
            
            return (
              <Card key={test.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{test.name}</CardTitle>
                      <CardDescription>
                        Testing {test.testType} • Created {test.createdAt}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusColor(test.status)}>
                      {test.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Test Configuration */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Split:</span>
                        <p className="font-medium">{test.splitPercentage}% / {100 - test.splitPercentage}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sample Size:</span>
                        <p className="font-medium">{test.sampleSize.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <p className="font-medium">{test.duration}h</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <p className="font-medium capitalize">{test.testType}</p>
                      </div>
                    </div>

                    {/* Variants */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Variant A</span>
                          {winner?.winner === 'A' && (
                            <Badge variant="default" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Winner
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {test.testType === 'subject' && test.variantA.subject}
                          {test.testType === 'content' && test.variantA.content}
                          {test.testType === 'sender' && test.variantA.sender}
                          {test.testType === 'send_time' && test.variantA.sendTime}
                        </p>
                        {test.results && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            Open Rate: {winner?.openRateA}%
                          </div>
                        )}
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Variant B</span>
                          {winner?.winner === 'B' && (
                            <Badge variant="default" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Winner
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {test.testType === 'subject' && test.variantB.subject}
                          {test.testType === 'content' && test.variantB.content}
                          {test.testType === 'sender' && test.variantB.sender}
                          {test.testType === 'send_time' && test.variantB.sendTime}
                        </p>
                        {test.results && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            Open Rate: {winner?.openRateB}%
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Results */}
                    {test.results && (
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="font-medium mb-3">Test Results</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">
                              {winner?.improvement}%
                            </div>
                            <div className="text-muted-foreground">Improvement</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">
                              {test.results.confidence}%
                            </div>
                            <div className="text-muted-foreground">Confidence</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">
                              {test.results.variantA.sent + test.results.variantB.sent}
                            </div>
                            <div className="text-muted-foreground">Total Sent</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {test.status === 'running' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Test Progress</span>
                          <span>2h remaining</span>
                        </div>
                        <Progress value={75} />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New A/B Test</CardTitle>
              <CardDescription>
                Test different versions of your email to optimize performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="testName">Test Name</Label>
                  <Input
                    id="testName"
                    value={newTest.name}
                    onChange={(e) => setNewTest(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Subject Line Test"
                  />
                </div>
                <div>
                  <Label htmlFor="testType">Test Type</Label>
                  <Select 
                    value={newTest.testType} 
                    onValueChange={(value) => setNewTest(prev => ({ ...prev, testType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="subject">Subject Line</SelectItem>
                      <SelectItem value="content">Email Content</SelectItem>
                      <SelectItem value="sender">Sender Name</SelectItem>
                      <SelectItem value="send_time">Send Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Variants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Variant A</h4>
                  {newTest.testType === 'subject' && (
                    <div>
                      <Label htmlFor="variantA-subject">Subject Line</Label>
                      <Input
                        id="variantA-subject"
                        value={newTest.variantA.subject}
                        onChange={(e) => setNewTest(prev => ({
                          ...prev,
                          variantA: { ...prev.variantA, subject: e.target.value }
                        }))}
                        placeholder="Welcome to our platform!"
                      />
                    </div>
                  )}
                  {newTest.testType === 'content' && (
                    <div>
                      <Label htmlFor="variantA-content">Email Content</Label>
                      <Textarea
                        id="variantA-content"
                        value={newTest.variantA.content}
                        onChange={(e) => setNewTest(prev => ({
                          ...prev,
                          variantA: { ...prev.variantA, content: e.target.value }
                        }))}
                        placeholder="Email content..."
                        rows={4}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Variant B</h4>
                  {newTest.testType === 'subject' && (
                    <div>
                      <Label htmlFor="variantB-subject">Subject Line</Label>
                      <Input
                        id="variantB-subject"
                        value={newTest.variantB.subject}
                        onChange={(e) => setNewTest(prev => ({
                          ...prev,
                          variantB: { ...prev.variantB, subject: e.target.value }
                        }))}
                        placeholder="Your journey begins now!"
                      />
                    </div>
                  )}
                  {newTest.testType === 'content' && (
                    <div>
                      <Label htmlFor="variantB-content">Email Content</Label>
                      <Textarea
                        id="variantB-content"
                        value={newTest.variantB.content}
                        onChange={(e) => setNewTest(prev => ({
                          ...prev,
                          variantB: { ...prev.variantB, content: e.target.value }
                        }))}
                        placeholder="Alternative email content..."
                        rows={4}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Test Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="splitPercentage">Split Percentage</Label>
                  <Select 
                    value={newTest.splitPercentage.toString()} 
                    onValueChange={(value) => setNewTest(prev => ({ 
                      ...prev, 
                      splitPercentage: parseInt(value) 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10% / 90%</SelectItem>
                      <SelectItem value="20">20% / 80%</SelectItem>
                      <SelectItem value="30">30% / 70%</SelectItem>
                      <SelectItem value="50">50% / 50%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sampleSize">Sample Size</Label>
                  <Input
                    id="sampleSize"
                    type="number"
                    value={newTest.sampleSize}
                    onChange={(e) => setNewTest(prev => ({ 
                      ...prev, 
                      sampleSize: parseInt(e.target.value) || 0 
                    }))}
                    min={100}
                    step={100}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (hours)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newTest.duration}
                    onChange={(e) => setNewTest(prev => ({ 
                      ...prev, 
                      duration: parseInt(e.target.value) || 0 
                    }))}
                    min={1}
                    max={168}
                  />
                </div>
              </div>

              <Button onClick={handleCreateTest} className="w-full">
                <FlaskConical className="w-4 h-4 mr-2" />
                Create A/B Test
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Best Performing Elements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Personalized subjects</span>
                    <span className="text-sm font-medium">+23% open rate</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Short subject lines (&lt;50 chars)</span>
                    <span className="text-sm font-medium">+18% open rate</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Question-based subjects</span>
                    <span className="text-sm font-medium">+15% open rate</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Testing Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>• Test subject lines with 50+ opens for statistical significance</p>
                  <p>• Run tests for at least 24 hours to account for timezone differences</p>
                  <p>• Focus on one element per test for clear results</p>
                  <p>• Test during consistent time periods</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Success Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">85%</div>
                    <div className="text-sm text-muted-foreground">Test Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">+19%</div>
                    <div className="text-sm text-muted-foreground">Avg. Performance Lift</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};