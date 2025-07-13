import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Eye, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ExternalLink,
  Scan,
  Globe,
  Activity
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ArtworkData {
  id: string;
  title: string;
  category: string;
  status: string;
  created_at: string;
  file_paths: string[];
}

interface ScanData {
  id: string;
  artwork_id: string;
  scan_type: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  matches_found: number;
  scanned_sources: number;
  total_sources: number;
}

interface MatchData {
  id: string;
  source_url: string;
  source_domain: string;
  source_title: string;
  match_confidence: number;
  match_type: string;
  threat_level: string;
  detected_at: string;
  is_authorized: boolean;
}

const RealTimeMonitoring = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [artworks, setArtworks] = useState<ArtworkData[]>([]);
  const [scans, setScans] = useState<ScanData[]>([]);
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtwork, setSelectedArtwork] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadArtworks();
      loadScans();
      loadMatches();
      
      // Set up real-time subscriptions
      const artworkChannel = supabase
        .channel('artwork-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'artwork', filter: `user_id=eq.${user.id}` },
          () => loadArtworks()
        )
        .subscribe();

      const scansChannel = supabase
        .channel('scans-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'monitoring_scans' },
          () => loadScans()
        )
        .subscribe();

      const matchesChannel = supabase
        .channel('matches-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'copyright_matches' },
          () => loadMatches()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(artworkChannel);
        supabase.removeChannel(scansChannel);
        supabase.removeChannel(matchesChannel);
      };
    }
  }, [user]);

  const loadArtworks = async () => {
    try {
      const { data, error } = await supabase
        .from('artwork')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArtworks(data || []);
    } catch (error: any) {
      console.error('Error loading artworks:', error);
    }
  };

  const loadScans = async () => {
    try {
      const { data, error } = await supabase
        .from('monitoring_scans')
        .select(`
          *,
          artwork!inner(user_id)
        `)
        .eq('artwork.user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScans(data || []);
    } catch (error: any) {
      console.error('Error loading scans:', error);
    }
  };

  const loadMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('copyright_matches')
        .select(`
          *,
          artwork!inner(user_id)
        `)
        .eq('artwork.user_id', user!.id)
        .order('detected_at', { ascending: false });

      if (error) throw error;
      setMatches(data || []);
      setLoading(false);
    } catch (error: any) {
      console.error('Error loading matches:', error);
      setLoading(false);
    }
  };

  const startNewScan = async (artworkId: string) => {
    try {
      // Find the artwork
      const artwork = artworks.find(a => a.id === artworkId);
      if (!artwork) {
        throw new Error('Artwork not found');
      }

      // Create scan record
      const { data: scan, error: scanError } = await supabase
        .from('monitoring_scans')
        .insert({
          artwork_id: artworkId,
          scan_type: 'deep',
          status: 'running',
          started_at: new Date().toISOString(),
          total_sources: 100
        })
        .select()
        .single();

      if (scanError) throw scanError;

      toast({
        title: "Scan Started",
        description: "Real-time monitoring scan initiated for your artwork",
      });

      // Get the first image file from storage to analyze
      if (artwork.file_paths.length > 0) {
        const firstImagePath = artwork.file_paths[0];
        
        // Get the image from storage
        const { data: imageData, error: imageError } = await supabase.storage
          .from('artwork')
          .download(firstImagePath);

        if (imageError) {
          console.error('Error downloading image:', imageError);
          return;
        }

        // Convert blob to base64 for analysis
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64Data = reader.result as string;
            const base64Image = base64Data.split(',')[1]; // Remove data:image/...;base64, prefix

            // Call the visual recognition edge function
            const { data: analysisData, error: analysisError } = await supabase.functions
              .invoke('visual-recognition', {
                body: {
                  image: base64Image,
                  artworkId: artworkId,
                  scanId: scan.id,
                  searchQuery: `${artwork.title} ${artwork.category}`,
                  enableRealTimeMonitoring: true
                }
              });

            if (analysisError) {
              console.error('Analysis error:', analysisError);
              
              // Update scan status to failed
              await supabase
                .from('monitoring_scans')
                .update({ status: 'failed' })
                .eq('id', scan.id);
              
              toast({
                title: "Analysis Failed",
                description: "Failed to analyze artwork for monitoring",
                variant: "destructive",
              });
            } else {
              toast({
                title: "Analysis Complete",
                description: "Artwork is now being monitored across web and dark web",
              });
            }
          } catch (error: any) {
            console.error('Processing error:', error);
            
            // Update scan status to failed
            await supabase
              .from('monitoring_scans')
              .update({ status: 'failed' })
              .eq('id', scan.id);
          }
        };

        reader.readAsDataURL(imageData);
      }

    } catch (error: any) {
      console.error('Scan error:', error);
      toast({
        title: "Scan Failed", 
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-500';
      case 'completed': return 'text-green-500';
      case 'failed': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="w-8 h-8 mx-auto mb-2 animate-spin" />
          <p className="text-muted-foreground">Loading monitoring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scans">Active Scans</TabsTrigger>
          <TabsTrigger value="matches">Copyright Matches</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Protected Artworks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{artworks.length}</div>
                <p className="text-xs text-muted-foreground">Total files monitored</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Scans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {scans.filter(s => s.status === 'running').length}
                </div>
                <p className="text-xs text-muted-foreground">Currently monitoring</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Matches Found</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{matches.length}</div>
                <p className="text-xs text-muted-foreground">Potential copyright issues</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Protected Artworks</CardTitle>
              <CardDescription>Manage and monitor your uploaded artworks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {artworks.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No artworks uploaded yet</p>
                  <p className="text-sm text-muted-foreground">Upload your first artwork to start monitoring</p>
                </div>
              ) : (
                artworks.map((artwork) => (
                  <div key={artwork.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{artwork.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {artwork.category} • {artwork.file_paths.length} file(s)
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {artwork.status}
                      </Badge>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => startNewScan(artwork.id)}
                    >
                      <Scan className="w-4 h-4 mr-2" />
                      New Scan
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Monitoring Scans</CardTitle>
              <CardDescription>Real-time scanning across web and dark web sources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {scans.length === 0 ? (
                <div className="text-center py-8">
                  <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No active scans</p>
                </div>
              ) : (
                scans.map((scan) => {
                  const artwork = artworks.find(a => a.id === scan.artwork_id);
                  const progress = scan.total_sources > 0 
                    ? (scan.scanned_sources / scan.total_sources) * 100 
                    : 0;

                  return (
                    <div key={scan.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{artwork?.title || 'Unknown Artwork'}</h4>
                          <p className="text-sm text-muted-foreground">
                            {scan.scan_type} scan • Started {new Date(scan.started_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline" className={getStatusColor(scan.status)}>
                          {scan.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{scan.scanned_sources}/{scan.total_sources} sources</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      {scan.matches_found > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          <span>{scan.matches_found} potential matches found</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Copyright Matches</CardTitle>
              <CardDescription>Detected uses of your artwork across the internet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {matches.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p className="text-muted-foreground">No copyright matches found</p>
                  <p className="text-sm text-muted-foreground">Your artwork appears to be safe</p>
                </div>
              ) : (
                matches.map((match) => (
                  <div key={match.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{match.source_title || 'Untitled'}</h4>
                        <p className="text-sm text-muted-foreground">{match.source_domain}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={getThreatColor(match.threat_level)}>
                            {match.threat_level} threat
                          </Badge>
                          <Badge variant="outline">
                            {Math.round(match.match_confidence * 100)}% match
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={match.source_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View
                        </a>
                      </Button>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      Detected on {new Date(match.detected_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealTimeMonitoring;