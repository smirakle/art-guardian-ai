import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Search, 
  Shield, 
  AlertTriangle, 
  Eye, 
  Globe, 
  Clock,
  ExternalLink,
  Zap
} from "lucide-react";
import DailyReport from "@/components/DailyReport";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ScanResult {
  id: string;
  marketplace: string;
  title: string;
  similarity: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  dateFound: string;
  price?: string;
  url: string;
  status: 'active' | 'removed' | 'investigating';
}


const DeepWebScan = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<ScanResult[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load real data from database
  useEffect(() => {
    if (!user) return;

    const fetchRealData = async () => {
      try {
        // Get user's artwork
        const { data: artworks } = await supabase
          .from('artwork')
          .select('id, title')
          .eq('user_id', user.id);

        if (artworks && artworks.length > 0) {
          const artworkIds = artworks.map(a => a.id);

          // Get monitoring scans
          const { data: scanData } = await supabase
            .from('monitoring_scans')
            .select('*')
            .in('artwork_id', artworkIds)
            .order('created_at', { ascending: false });

          // Get copyright matches
          const { data: matchData } = await supabase
            .from('copyright_matches')
            .select('*')
            .in('artwork_id', artworkIds)
            .order('detected_at', { ascending: false });

          if (scanData) {
            setScans(scanData);
          }

          if (matchData) {
            // Convert database matches to ScanResult format
            const formattedResults: ScanResult[] = matchData.map(match => ({
              id: match.id,
              marketplace: match.source_domain || 'Unknown Platform',
              title: match.source_title || 'Untitled Match',
              similarity: match.match_confidence,
              riskLevel: match.threat_level as 'low' | 'medium' | 'high' | 'critical',
              dateFound: new Date(match.detected_at).toISOString().split('T')[0],
              url: match.source_url,
              status: match.is_authorized ? 'removed' : 'active'
            }));
            setResults(formattedResults);
          }
        }
      } catch (error) {
        console.error('Error fetching real-time data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
    
    // Update every 30 seconds
    const interval = setInterval(fetchRealData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const startNewScan = async () => {
    if (!user) return;
    
    try {
      // Get user's first artwork for scanning
      const { data: artworks } = await supabase
        .from('artwork')
        .select('id, title')
        .eq('user_id', user.id)
        .limit(1);

      if (artworks && artworks.length > 0) {
        const artwork = artworks[0];
        
        // Create new scan
        const { data: newScan } = await supabase
          .from('monitoring_scans')
          .insert({
            artwork_id: artwork.id,
            scan_type: 'deep',
            status: 'running',
            started_at: new Date().toISOString(),
            total_sources: 52000
          })
          .select()
          .single();

        if (newScan) {
          // Invoke monitoring scan
          await supabase.functions.invoke('process-monitoring-scan', {
            body: {
              scanId: newScan.id,
              artworkId: artwork.id
            }
          });
        }
      }
    } catch (error) {
      console.error('Error starting scan:', error);
    }
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      default: return 'default';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'destructive';
      case 'removed': return 'default';
      case 'investigating': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-white pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Active Web Monitoring
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Real-time scanning across 52,000+ white web and dark web sources for copyright infringement
            </p>
          </div>

          {/* Scan Control */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Active Monitoring System
                <Badge variant="secondary" className="ml-2">
                  {scans.filter(scan => scan.status === 'running').length > 0 ? 'LIVE' : 'IDLE'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="font-semibold text-lg">
                      {scans.reduce((sum, scan) => sum + (scan.scanned_sources || 0), 0).toLocaleString()}
                    </div>
                    <div className="text-muted-foreground">Sources Scanned</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="font-semibold text-lg">
                      {scans.reduce((sum, scan) => sum + (scan.total_sources || 0), 0).toLocaleString()}
                    </div>
                    <div className="text-muted-foreground">Total Sources</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="font-semibold text-lg">
                      {scans.filter(scan => scan.status === 'running').length}
                    </div>
                    <div className="text-muted-foreground">Active Scanners</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Real-time monitoring status</span>
                    <span className="text-sm font-medium">
                      {scans.filter(scan => scan.status === 'running').length > 0 ? 'Active' : 'Idle'}
                    </span>
                  </div>
                  <Progress 
                    value={scans.length > 0 ? 
                      (scans.reduce((sum, scan) => sum + (scan.scanned_sources || 0), 0) / 
                       Math.max(1, scans.reduce((sum, scan) => sum + (scan.total_sources || 0), 0))) * 100 : 0
                    } 
                    className="w-full" 
                  />
                  <div className="text-xs text-muted-foreground">
                    Real-time scanning across web, dark web marketplaces, forums, and social platforms
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={startNewScan} className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Start New Scan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {!loading && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="threats">Active Threats</TabsTrigger>
                <TabsTrigger value="history">Scan History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        <div>
                          <div className="text-2xl font-bold">
                            {results.filter(r => r.riskLevel === 'critical').length}
                          </div>
                          <div className="text-xs text-muted-foreground">Critical Threats</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Eye className="w-5 h-5 text-primary" />
                        <div>
                          <div className="text-2xl font-bold">{results.length}</div>
                          <div className="text-xs text-muted-foreground">Monitored Items</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-accent" />
                        <div>
                          <div className="text-2xl font-bold">
                            {scans.reduce((sum, scan) => sum + (scan.total_sources || 0), 0).toLocaleString()}+
                          </div>
                          <div className="text-xs text-muted-foreground">Sources</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-secondary" />
                        <div>
                          <div className="text-2xl font-bold">24/7</div>
                          <div className="text-xs text-muted-foreground">Monitoring</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Findings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Findings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {results.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Shield className="w-12 h-12 mx-auto mb-4 text-green-500" />
                        <h3 className="font-medium mb-2">No Threats Detected</h3>
                        <p className="text-sm">Your artwork is protected - no unauthorized usage found</p>
                      </div>
                    ) : (
                      results.map((result) => (
                      <div key={result.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium">{result.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              Found on: {result.marketplace}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={getRiskBadgeVariant(result.riskLevel)}>
                              {result.riskLevel}
                            </Badge>
                            <Badge variant={getStatusBadgeVariant(result.status)}>
                              {result.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <span>Similarity: {result.similarity}%</span>
                            <span>Found: {result.dateFound}</span>
                            {result.price && <span>Price: {result.price}</span>}
                          </div>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Investigate
                          </Button>
                        </div>
                      </div>
                    )))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="threats" className="space-y-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Critical threats require immediate attention. Contact legal authorities for copyright enforcement.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  {results.filter(r => r.riskLevel === 'critical' || r.riskLevel === 'high').map((result) => (
                    <Card key={result.id} className="border-destructive/50">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{result.title}</h3>
                            <p className="text-muted-foreground">{result.marketplace}</p>
                          </div>
                          <Badge variant={getRiskBadgeVariant(result.riskLevel)} className="text-xs">
                            {result.riskLevel} risk
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Similarity:</span>
                            <div className="font-medium">{result.similarity}%</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Date Found:</span>
                            <div className="font-medium">{result.dateFound}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Price:</span>
                            <div className="font-medium">{result.price || 'N/A'}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Status:</span>
                            <div className="font-medium capitalize">{result.status}</div>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button variant="destructive" size="sm">
                            <Shield className="w-3 h-3 mr-1" />
                            File DMCA
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="w-3 h-3 mr-1" />
                            Monitor
                          </Button>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Scan History</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <div className="space-y-3">
                         {scans.length === 0 ? (
                           <div className="text-center py-8 text-muted-foreground">
                             <Search className="w-12 h-12 mx-auto mb-4" />
                             <h3 className="font-medium mb-2">No Scan History</h3>
                             <p className="text-sm">Start your first scan to see monitoring history</p>
                           </div>
                         ) : (
                           scans.map((scan) => (
                             <div key={scan.id} className="flex items-center justify-between p-3 border rounded">
                               <div>
                                 <div className="font-medium">{scan.scan_type} scan</div>
                                 <div className="text-sm text-muted-foreground">
                                   {new Date(scan.created_at).toLocaleDateString()} - {new Date(scan.created_at).toLocaleTimeString()}
                                 </div>
                               </div>
                               <div className="text-right">
                                 <div className="font-medium">{scan.matches_found || 0} threats found</div>
                                 <div className="text-sm text-muted-foreground">
                                   {(scan.scanned_sources || 0).toLocaleString()} sources scanned
                                 </div>
                               </div>
                             </div>
                           ))
                         )}
                       </div>
                    </CardContent>
                  </Card>
                  
                  <DailyReport type="deep-scan" />
                </div>
              </TabsContent>
            </Tabs>
          )}

          {/* Empty State */}
          {false && (
            <Card className="text-center py-12">
              <CardContent>
                <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Recent Scans</h3>
                <p className="text-muted-foreground mb-6">
                  Start a deep web scan to monitor for unauthorized use of your artwork
                </p>
                <Button onClick={startNewScan} className="flex items-center gap-2 mx-auto">
                  <Zap className="w-4 h-4" />
                  Begin Monitoring
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeepWebScan;