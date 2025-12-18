import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Eye, 
  Image,
  AlertTriangle,
  Shield,
  Activity,
  CheckCircle,
  Zap,
  Briefcase,
  Loader2
} from 'lucide-react';
import { BugReportButton } from '@/components/BugReportButton';
import { PortfolioDashboard } from '@/components/portfolio/PortfolioDashboard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const MonitoringHub = () => {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [stats, setStats] = useState({ threats: 0, protected: 0, rate: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch threats (copyright matches + AI threat detections)
        const [matchesRes, threatsRes, artworkRes, protectionRes] = await Promise.all([
          supabase
            .from('copyright_matches')
            .select('id', { count: 'exact', head: true }),
          supabase
            .from('ai_threat_detections')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id),
          supabase
            .from('artwork')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id),
          supabase
            .from('ai_protection_records')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
        ]);

        const threatCount = (matchesRes.count || 0) + (threatsRes.count || 0);
        const protectedCount = (artworkRes.count || 0) + (protectionRes.count || 0);
        
        // Calculate protection rate (items without high threats / total items)
        const rate = protectedCount > 0 
          ? Math.max(0, Math.round(((protectedCount - threatCount) / protectedCount) * 100))
          : 100;

        setStats({
          threats: threatCount,
          protected: protectedCount,
          rate: Math.min(100, Math.max(0, rate))
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Simplified Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Search className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Find Copies</h1>
        </div>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Scan the web to find unauthorized copies of your content
        </p>
      </div>

      {/* Stats with real data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-orange-500" />
            {loading ? (
              <Loader2 className="h-6 w-6 mx-auto animate-spin" />
            ) : (
              <div className="text-2xl font-bold">{stats.threats}</div>
            )}
            <p className="text-sm text-muted-foreground">Threats Found</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6 text-center">
            <Shield className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            {loading ? (
              <Loader2 className="h-6 w-6 mx-auto animate-spin" />
            ) : (
              <div className="text-2xl font-bold">{stats.protected}</div>
            )}
            <p className="text-sm text-muted-foreground">Items Protected</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6 text-center">
            <Activity className="h-6 w-6 mx-auto mb-2 text-green-500" />
            {loading ? (
              <Loader2 className="h-6 w-6 mx-auto animate-spin" />
            ) : (
              <div className="text-2xl font-bold">{stats.rate}%</div>
            )}
            <p className="text-sm text-muted-foreground">Protection Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="portfolio" className="flex items-center gap-2 py-3">
            <Briefcase className="h-4 w-4" />
            <span>Portfolio</span>
          </TabsTrigger>
          <TabsTrigger value="deepfake" className="flex items-center gap-2 py-3">
            <Eye className="h-4 w-4" />
            <span>Deepfake</span>
          </TabsTrigger>
          <TabsTrigger value="forgery" className="flex items-center gap-2 py-3">
            <Image className="h-4 w-4" />
            <span>Forgery</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-6">
          <PortfolioDashboard />
        </TabsContent>

        <TabsContent value="deepfake" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Deepfake Detection
              </CardTitle>
              <CardDescription>
                Detect AI-generated faces, voice clones, and synthetic media
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold">98.7%</div>
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">2.3s</div>
                  <div className="text-xs text-muted-foreground">Avg Speed</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">47</div>
                  <div className="text-xs text-muted-foreground">Platforms</div>
                </div>
              </div>
              
              <Button className="w-full" size="lg" onClick={() => navigate('/forgery-detection?tab=ai-detection')}>
                <Search className="h-4 w-4 mr-2" />
                Start Deepfake Scan
              </Button>

              <div className="space-y-2 pt-4 border-t">
                <h4 className="text-sm font-medium text-muted-foreground">Recent Detections</h4>
                <div className="flex justify-between items-center p-2 bg-destructive/10 rounded-lg">
                  <span className="text-sm">High-quality deepfake detected</span>
                  <Badge variant="destructive">Critical</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-orange-500/10 rounded-lg">
                  <span className="text-sm">Face swap attempt identified</span>
                  <Badge className="bg-orange-500">Warning</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forgery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5 text-primary" />
                Image Forgery Analysis
              </CardTitle>
              <CardDescription>
                Detect manipulation, splicing, and AI-generated content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {['Manipulation Detection', 'Metadata Analysis', 'AI-Generated Detection'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{item}</span>
                    <Badge variant="outline" className="ml-auto text-xs">Active</Badge>
                  </div>
                ))}
              </div>
              
              <Button className="w-full" size="lg" onClick={() => navigate('/forgery-detection?tab=forgery-detection')}>
                <Image className="h-4 w-4 mr-2" />
                Analyze Image
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <Button 
          size="lg"
          className="h-auto py-4"
          onClick={() => navigate('/portfolio-monitoring')}
        >
          <Search className="h-5 w-5 mr-2" />
          <div className="text-left">
            <div className="font-semibold">Scan for Copies</div>
            <div className="text-xs opacity-90">Full portfolio analysis</div>
          </div>
        </Button>
        <Button 
          variant="outline"
          size="lg"
          className="h-auto py-4"
          onClick={() => navigate('/ai-protection')}
        >
          <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
          <div className="text-left">
            <div className="font-semibold">View Alerts</div>
            <div className="text-xs text-muted-foreground">{stats.threats} threats found</div>
          </div>
        </Button>
      </div>

      <BugReportButton />
    </div>
  );
};

export default MonitoringHub;
