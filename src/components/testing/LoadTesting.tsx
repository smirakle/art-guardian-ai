import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Play, 
  Square, 
  BarChart3, 
  Clock, 
  Users, 
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LoadTest {
  id: string;
  name: string;
  target_url: string;
  concurrent_users: number;
  duration_seconds: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  results?: {
    total_requests: number;
    successful_requests: number;
    failed_requests: number;
    avg_response_time: number;
    max_response_time: number;
    min_response_time: number;
    requests_per_second: number;
    error_rate: number;
  };
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export const LoadTesting = () => {
  const [tests, setTests] = useState<LoadTest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [runningTest, setRunningTest] = useState<LoadTest | null>(null);
  const [newTest, setNewTest] = useState({
    name: '',
    target_url: '',
    concurrent_users: 10,
    duration_seconds: 300,
    test_type: 'stress'
  });
  const { toast } = useToast();

  useEffect(() => {
    loadTests();
    
    // Poll for running test updates
    const interval = setInterval(() => {
      if (runningTest) {
        loadTests();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [runningTest]);

  const loadTests = async () => {
    try {
      // Mock data for now - production would use database
      setTests([]);
      setRunningTest(null);
    } catch (error) {
      console.error('Error loading tests:', error);
    }
  };

  const startLoadTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('start-load-test', {
        body: newTest
      });

      if (error) throw error;

      toast({
        title: "Load Test Started",
        description: "Your load test has been queued and will start shortly.",
      });

      setNewTest({
        name: '',
        target_url: '',
        concurrent_users: 10,
        duration_seconds: 300,
        test_type: 'stress'
      });
      
      loadTests();
    } catch (error) {
      console.error('Error starting load test:', error);
      toast({
        title: "Error",
        description: "Failed to start load test. Please check your configuration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stopLoadTest = async (testId: string) => {
    try {
      const { error } = await supabase.functions.invoke('stop-load-test', {
        body: { test_id: testId }
      });

      if (error) throw error;

      toast({
        title: "Load Test Stopped",
        description: "The load test has been stopped.",
      });

      loadTests();
    } catch (error) {
      console.error('Error stopping load test:', error);
      toast({
        title: "Error",
        description: "Failed to stop load test.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'running':
        return <Play className="w-5 h-5 text-blue-500" />;
      case 'failed':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Load Testing</h2>
          <p className="text-muted-foreground">
            Test your application's performance under various load conditions
          </p>
        </div>
        <Badge variant="secondary">Performance Testing</Badge>
      </div>

      {/* Running Test Status */}
      {runningTest && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Play className="w-6 h-6 text-blue-500" />
                <div>
                  <h3 className="font-semibold">{runningTest.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Testing {runningTest.target_url} with {runningTest.concurrent_users} users
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => stopLoadTest(runningTest.id)}
              >
                <Square className="w-4 h-4 mr-2" />
                Stop Test
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{runningTest.progress}%</span>
              </div>
              <Progress value={runningTest.progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="create">
        <TabsList>
          <TabsTrigger value="create">Create Test</TabsTrigger>
          <TabsTrigger value="history">Test History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create Load Test</CardTitle>
              <CardDescription>
                Configure a new load test to evaluate your application's performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={startLoadTest} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="test-name">Test Name</Label>
                    <Input
                      id="test-name"
                      value={newTest.name}
                      onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                      placeholder="e.g., Homepage Stress Test"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="test-type">Test Type</Label>
                    <Select 
                      value={newTest.test_type} 
                      onValueChange={(value) => setNewTest({ ...newTest, test_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="load">Load Test (Normal Traffic)</SelectItem>
                        <SelectItem value="stress">Stress Test (Peak Traffic)</SelectItem>
                        <SelectItem value="spike">Spike Test (Sudden Traffic)</SelectItem>
                        <SelectItem value="endurance">Endurance Test (Extended)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="target-url">Target URL</Label>
                  <Input
                    id="target-url"
                    type="url"
                    value={newTest.target_url}
                    onChange={(e) => setNewTest({ ...newTest, target_url: e.target.value })}
                    placeholder="https://your-app.com"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="concurrent-users">Concurrent Users</Label>
                    <Input
                      id="concurrent-users"
                      type="number"
                      min="1"
                      max="1000"
                      value={newTest.concurrent_users}
                      onChange={(e) => setNewTest({ ...newTest, concurrent_users: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (seconds)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="10"
                      max="3600"
                      value={newTest.duration_seconds}
                      onChange={(e) => setNewTest({ ...newTest, duration_seconds: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800">Important Notice</p>
                    <p className="text-yellow-700">
                      Only test URLs that you own or have permission to test. High-load testing 
                      can impact server performance and may violate terms of service.
                    </p>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading || !!runningTest}
                  className="w-full"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {runningTest ? 'Test in Progress' : 'Start Load Test'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {tests.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Tests Yet</h3>
                  <p className="text-muted-foreground">
                    Create your first load test to start performance testing
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {tests.map((test) => (
                <Card key={test.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <h3 className="font-semibold">{test.name}</h3>
                          <p className="text-sm text-muted-foreground">{test.target_url}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge variant={test.status === 'completed' ? 'default' : 'secondary'}>
                          {test.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {test.concurrent_users} users • {formatDuration(test.duration_seconds)}
                        </p>
                      </div>
                    </div>

                    {test.results && (
                      <div className="mt-4 grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <p className="text-lg font-bold">{test.results.total_requests}</p>
                          <p className="text-sm text-muted-foreground">Total Requests</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold">{test.results.avg_response_time}ms</p>
                          <p className="text-sm text-muted-foreground">Avg Response</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold">{test.results.requests_per_second.toFixed(1)}</p>
                          <p className="text-sm text-muted-foreground">Req/sec</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-lg font-bold ${test.results.error_rate > 5 ? 'text-red-600' : 'text-green-600'}`}>
                            {test.results.error_rate.toFixed(1)}%
                          </p>
                          <p className="text-sm text-muted-foreground">Error Rate</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Start Templates</CardTitle>
                <CardDescription>
                  Pre-configured test scenarios for common use cases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      name: "Website Load Test",
                      description: "Test normal website traffic patterns",
                      users: 50,
                      duration: 300
                    },
                    {
                      name: "API Stress Test",
                      description: "High-load API endpoint testing",
                      users: 100,
                      duration: 180
                    },
                    {
                      name: "E-commerce Peak",
                      description: "Simulate shopping peak periods",
                      users: 200,
                      duration: 600
                    },
                    {
                      name: "Mobile App Backend",
                      description: "Test mobile API performance",
                      users: 75,
                      duration: 300
                    }
                  ].map((template) => (
                    <Card key={template.name} className="cursor-pointer hover:bg-gray-50">
                      <CardContent className="pt-6">
                        <h3 className="font-semibold mb-2">{template.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                        <div className="flex justify-between text-sm">
                          <span>{template.users} users</span>
                          <span>{formatDuration(template.duration)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                Analyze trends and patterns from your load tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
                <p className="text-muted-foreground">
                  Detailed performance trends and insights coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};