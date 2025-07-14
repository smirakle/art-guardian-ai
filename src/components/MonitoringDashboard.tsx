import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Eye, Search, Shield, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface MonitoringScan {
  id: string;
  artwork_title: string;
  status: string;
  scan_type: string;
  scanned_sources: number;
  total_sources: number;
  matches_found: number;
  started_at: string;
  completed_at: string | null;
}

interface CopyrightMatch {
  id: string;
  source_domain: string;
  source_title: string;
  match_confidence: number;
  match_type: string;
  threat_level: string;
  detected_at: string;
}

const MonitoringDashboard = () => {
  const { user } = useAuth();
  const [scans, setScans] = useState<MonitoringScan[]>([]);
  const [matches, setMatches] = useState<CopyrightMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Get user's artwork and their scans
        const { data: artworks } = await supabase
          .from('artwork')
          .select('id, title')
          .eq('user_id', user.id);

        if (artworks && artworks.length > 0) {
          const artworkIds = artworks.map(a => a.id);

          // Get monitoring scans
          const { data: scanData } = await supabase
            .from('monitoring_scans')
            .select(`
              id,
              scan_type,
              status,
              scanned_sources,
              total_sources,
              matches_found,
              started_at,
              completed_at,
              artwork:artwork_id(title)
            `)
            .in('artwork_id', artworkIds)
            .order('created_at', { ascending: false })
            .limit(10);

          // Get copyright matches
          const { data: matchData } = await supabase
            .from('copyright_matches')
            .select('*')
            .in('artwork_id', artworkIds)
            .order('detected_at', { ascending: false })
            .limit(20);

          if (scanData) {
            const formattedScans = scanData.map(scan => ({
              ...scan,
              artwork_title: (scan.artwork as any)?.title || 'Unknown Artwork'
            }));
            setScans(formattedScans);
          }

          if (matchData) {
            setMatches(matchData);
          }
        }
      } catch (error) {
        console.error('Error fetching monitoring data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000); // Refresh every 15 seconds

    return () => clearInterval(interval);
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) {
    return <div className="p-4">Loading monitoring dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="scans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="scans">Active Scans</TabsTrigger>
          <TabsTrigger value="matches">Copyright Matches</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="scans" className="space-y-4">
          {scans.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No Active Scans</h3>
                  <p className="text-sm">Upload artwork to start monitoring scans</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            scans.map((scan) => (
              <Card key={scan.id} className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{scan.artwork_title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(scan.status)}`} />
                      <span className="text-sm capitalize">{scan.status}</span>
                    </div>
                  </div>
                  <CardDescription>{scan.scan_type} scan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {scan.status === 'running' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{scan.scanned_sources?.toLocaleString() || 0} / {scan.total_sources?.toLocaleString() || 0} sources</span>
                      </div>
                      <Progress 
                        value={scan.total_sources ? (scan.scanned_sources / scan.total_sources) * 100 : 0} 
                        className="w-full" 
                      />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Sources Scanned</div>
                      <div className="font-medium">{scan.scanned_sources?.toLocaleString() || 0}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Matches Found</div>
                      <div className="font-medium text-orange-500">{scan.matches_found || 0}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Started</div>
                      <div className="font-medium">{new Date(scan.started_at).toLocaleTimeString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          {matches.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <h3 className="font-medium mb-2">No Matches Found</h3>
                  <p className="text-sm">Your content is protected - no unauthorized usage detected</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            matches.map((match) => (
              <Card key={match.id} className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{match.source_title || match.source_domain}</CardTitle>
                    <Badge variant={getThreatColor(match.threat_level)}>
                      {Math.round(match.match_confidence)}% match
                    </Badge>
                  </div>
                  <CardDescription>
                    {match.match_type} match found on {match.source_domain}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <span className="capitalize">{match.threat_level} threat</span>
                    </div>
                    <span className="text-muted-foreground">
                      {new Date(match.detected_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Scan Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Scans Completed</span>
                    <span className="font-medium">{scans.filter(s => s.status === 'completed').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Scans</span>
                    <span className="font-medium">{scans.filter(s => s.status === 'running').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Matches</span>
                    <span className="font-medium text-orange-500">{matches.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>High Risk Matches</span>
                    <span className="font-medium text-red-500">
                      {matches.filter(m => m.threat_level === 'high').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Detection Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Exact Matches</span>
                    <span className="font-medium">
                      {matches.filter(m => m.match_type === 'exact').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Similar Matches</span>
                    <span className="font-medium">
                      {matches.filter(m => m.match_type === 'similar').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Confidence</span>
                    <span className="font-medium">
                      {matches.length > 0 
                        ? Math.round(matches.reduce((sum, m) => sum + m.match_confidence, 0) / matches.length)
                        : 0}%
                    </span>
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

export default MonitoringDashboard;