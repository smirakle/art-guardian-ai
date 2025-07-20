import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Eye, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ExternalLink,
  Scan,
  Globe,
  Activity,
  Trash2,
  MoreVertical
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
  artwork_id: string;
  scan_id: string;
  source_url: string;
  source_domain: string;
  source_title: string;
  match_confidence: number;
  match_type: string;
  threat_level: string;
  detected_at: string;
  is_authorized: boolean;
  thumbnail_url: string | null;
  image_url: string | null;
  description: string | null;
  context: string | null;
  is_reviewed: boolean | null;
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
    console.log('RealTimeMonitoring: useEffect triggered, user:', user);
    if (user) {
      console.log('RealTimeMonitoring: User authenticated, loading real data...');
      loadAllData();
      
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
    } else {
      console.log('RealTimeMonitoring: No user, loading demo data...');
      loadDemoData();
    }
  }, [user]);

  const loadArtworks = async () => {
    console.log('RealTimeMonitoring: loadArtworks called');
    try {
      const { data, error } = await supabase
        .from('artwork')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('RealTimeMonitoring: Artworks loaded:', data?.length || 0);
      setArtworks(data || []);
    } catch (error: any) {
      console.error('RealTimeMonitoring: Error loading artworks:', error);
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
    } catch (error: any) {
      console.error('Error loading matches:', error);
    }
  };

  const loadAllData = async () => {
    console.log('RealTimeMonitoring: loadAllData called');
    setLoading(true);
    try {
      console.log('RealTimeMonitoring: Starting data load...');
      await Promise.all([
        loadArtworks(),
        loadScans(),
        loadMatches()
      ]);
      console.log('RealTimeMonitoring: Data loaded successfully');
    } catch (error) {
      console.error('RealTimeMonitoring: Error loading monitoring data:', error);
    } finally {
      setLoading(false);
      console.log('RealTimeMonitoring: Loading completed');
    }
  };

  const loadDemoData = () => {
    console.log('RealTimeMonitoring: Loading demo data...');
    setLoading(true);
    
    // Demo artwork data
    const demoArtworks: ArtworkData[] = [
      {
        id: 'demo-1',
        title: 'Digital Portrait Collection',
        category: 'Digital Art',
        status: 'protected',
        created_at: new Date().toISOString(),
        file_paths: ['demo/portrait1.jpg', 'demo/portrait2.jpg']
      },
      {
        id: 'demo-2', 
        title: 'Abstract Landscape Series',
        category: 'Photography',
        status: 'scanning',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        file_paths: ['demo/landscape1.jpg']
      },
      {
        id: 'demo-3',
        title: 'Cyberpunk Character Design',
        category: 'Concept Art',
        status: 'protected',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        file_paths: ['demo/character1.png', 'demo/character2.png', 'demo/character3.png']
      }
    ];

    // Demo scan data
    const demoScans: ScanData[] = [
      {
        id: 'scan-1',
        artwork_id: 'demo-1',
        scan_type: 'deep',
        status: 'running',
        started_at: new Date(Date.now() - 3600000).toISOString(),
        completed_at: null,
        matches_found: 2,
        scanned_sources: 750000,
        total_sources: 1000000
      },
      {
        id: 'scan-2',
        artwork_id: 'demo-2',
        scan_type: 'standard',
        status: 'completed',
        started_at: new Date(Date.now() - 86400000).toISOString(),
        completed_at: new Date(Date.now() - 82800000).toISOString(),
        matches_found: 0,
        scanned_sources: 500000,
        total_sources: 500000
      },
      {
        id: 'scan-3',
        artwork_id: 'demo-3',
        scan_type: 'deep',
        status: 'completed',
        started_at: new Date(Date.now() - 172800000).toISOString(),
        completed_at: new Date(Date.now() - 169200000).toISOString(),
        matches_found: 3,
        scanned_sources: 1000000,
        total_sources: 1000000
      }
    ];

    // Demo match data
    const demoMatches: MatchData[] = [
      {
        id: 'match-1',
        artwork_id: 'demo-1',
        scan_id: 'scan-1',
        source_url: 'https://example-marketplace.com/artwork/stolen-portrait',
        source_domain: 'example-marketplace.com',
        source_title: 'Digital Portrait for Sale',
        match_confidence: 95.5,
        match_type: 'exact',
        threat_level: 'high',
        detected_at: new Date(Date.now() - 1800000).toISOString(),
        is_authorized: false,
        thumbnail_url: null,
        image_url: null,
        description: 'Exact copy found on digital marketplace',
        context: 'Listed for commercial sale without permission',
        is_reviewed: false
      },
      {
        id: 'match-2',
        artwork_id: 'demo-1',
        scan_id: 'scan-1',
        source_url: 'https://social-platform.com/user123/post456',
        source_domain: 'social-platform.com',
        source_title: 'Amazing digital art I found!',
        match_confidence: 88.2,
        match_type: 'similar',
        threat_level: 'medium',
        detected_at: new Date(Date.now() - 3600000).toISOString(),
        is_authorized: false,
        thumbnail_url: null,
        image_url: null,
        description: 'Modified version shared on social media',
        context: 'User claiming as their own work',
        is_reviewed: false
      },
      {
        id: 'match-3',
        artwork_id: 'demo-3',
        scan_id: 'scan-3',
        source_url: 'https://design-blog.net/cyberpunk-inspiration',
        source_domain: 'design-blog.net',
        source_title: 'Cyberpunk Character Inspiration',
        match_confidence: 92.1,
        match_type: 'exact',
        threat_level: 'high',
        detected_at: new Date(Date.now() - 172800000).toISOString(),
        is_authorized: false,
        thumbnail_url: null,
        image_url: null,
        description: 'Used in blog post without attribution',
        context: 'Commercial blog using artwork without permission',
        is_reviewed: true
      }
    ];

    setArtworks(demoArtworks);
    setScans(demoScans);
    setMatches(demoMatches);
    setLoading(false);
    console.log('RealTimeMonitoring: Demo data loaded successfully');
  };

  const startNewScan = async (artworkId: string) => {
    if (!user) {
      toast({
        title: "Demo Mode",
        description: "Sign in to access real scanning functionality",
      });
      return;
    }
    
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
          total_sources: 1000000
        })
        .select()
        .single();

      if (scanError) throw scanError;

      toast({
        title: "Scan Started",
        description: "Real-time monitoring scan initiated for your artwork",
      });

      // Start monitoring scan directly with the edge function
      console.log('Starting monitoring scan for:', scan.id, artworkId);
      console.log('Invoking edge function process-monitoring-scan...');
      
      const { data: analysisData, error: analysisError } = await supabase.functions
        .invoke('process-monitoring-scan', {
          body: {
            scanId: scan.id,
            artworkId: artworkId
          }
        });

      if (analysisError) {
        console.error('Monitoring scan error:', analysisError);
        
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
        console.log('Edge function invoked successfully:', analysisData);
        
        toast({
          title: "Analysis Complete",
          description: "Artwork is now being monitored across 1M+ sources including dark web",
        });
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

  const deleteArtwork = async (artworkId: string) => {
    if (!user) {
      toast({
        title: "Demo Mode",
        description: "Sign in to access real management functionality",
      });
      return;
    }
    
    try {
      const artwork = artworks.find(a => a.id === artworkId);
      if (!artwork) {
        throw new Error('Artwork not found');
      }

      // Delete files from storage
      if (artwork.file_paths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('artwork')
          .remove(artwork.file_paths);
        
        if (storageError) {
          console.error('Error deleting files from storage:', storageError);
        }
      }

      // Delete the artwork record (this will cascade delete related scans and matches)
      const { error: deleteError } = await supabase
        .from('artwork')
        .delete()
        .eq('id', artworkId);

      if (deleteError) throw deleteError;

      toast({
        title: "Artwork Deleted",
        description: "Your artwork and all related monitoring data have been removed",
      });

      // Refresh the data
      await loadArtworks();
      await loadScans();
      await loadMatches();

    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
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
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => startNewScan(artwork.id)}
                      >
                        <Scan className="w-4 h-4 mr-2" />
                        New Scan
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Artwork
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Artwork</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{artwork.title}"? This action cannot be undone and will remove all monitoring data, scans, and matches associated with this artwork.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteArtwork(artwork.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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
              <CardDescription>Real-time scanning across 1M+ sources including dark web platforms</CardDescription>
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
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                            <span>{scan.matches_found} potential matches found</span>
                          </div>
                          <div className="border rounded-md p-3 bg-muted/30">
                            <h5 className="text-sm font-medium mb-2">Potential Matches</h5>
                            <div className="space-y-3">
                              {matches
                                .filter(match => match.scan_id === scan.id)
                                .slice(0, 3)
                                .map(match => (
                                  <div key={match.id} className="flex items-start gap-3 text-sm">
                                    {match.thumbnail_url && (
                                      <div className="flex-shrink-0">
                                        <img 
                                          src={match.thumbnail_url} 
                                          alt={match.source_title || 'Image match'} 
                                          className="w-16 h-16 object-cover rounded-md"
                                        />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-start">
                                        <p className="font-medium truncate">{match.source_title || 'Untitled'}</p>
                                        <Badge variant={getThreatColor(match.threat_level)} className="ml-2">
                                          {Math.round(match.match_confidence * 100)}%
                                        </Badge>
                                      </div>
                                      <p className="text-muted-foreground text-xs truncate">{match.source_domain}</p>
                                      <div className="flex justify-between items-center mt-1">
                                        <Badge variant="outline" className="text-xs">
                                          {match.match_type}
                                        </Badge>
                                        <Button variant="ghost" size="sm" className="h-6 px-2" asChild>
                                          <a href={match.source_url} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="w-3 h-3 mr-1" />
                                            View
                                          </a>
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              {matches.filter(match => match.scan_id === scan.id).length > 3 && (
                                <Button variant="link" size="sm" className="w-full mt-1 h-6">
                                  View all matches
                                </Button>
                              )}
                            </div>
                          </div>
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
                    <div className="flex gap-4">
                      {match.thumbnail_url && (
                        <div className="flex-shrink-0">
                          <img 
                            src={match.thumbnail_url} 
                            alt={match.source_title || "Image match"} 
                            className="w-24 h-24 object-cover rounded-md border"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium">{match.source_title || 'Untitled'}</h4>
                            <p className="text-sm text-muted-foreground">{match.source_domain || 'Unknown domain'}</p>
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
                        
                        <p className="text-sm text-muted-foreground mt-2">
                          Detected on {new Date(match.detected_at).toLocaleDateString()}
                        </p>
                        
                        {match.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {match.description}
                          </p>
                        )}
                      </div>
                    </div>
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