import { useState } from "react";
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

const mockResults: ScanResult[] = [
  {
    id: '1',
    marketplace: 'Dark Auction House',
    title: 'Digital Art Collection #1',
    similarity: 94,
    riskLevel: 'critical',
    dateFound: '2024-01-08',
    price: '0.5 BTC',
    url: 'onion://darkauction.v3/item/12345',
    status: 'active'
  },
  {
    id: '2',
    marketplace: 'Shadow Market',
    title: 'Premium Art Bundle',
    similarity: 87,
    riskLevel: 'high',
    dateFound: '2024-01-07',
    price: '200 XMR',
    url: 'onion://shadowmkt.v3/listing/67890',
    status: 'investigating'
  },
  {
    id: '3',
    marketplace: 'Deep Gallery',
    title: 'Stolen Digital Assets',
    similarity: 76,
    riskLevel: 'medium',
    dateFound: '2024-01-06',
    url: 'onion://deepgal.v3/gallery/abc123',
    status: 'removed'
  }
];

const DeepWebScan = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  const startScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    setResults([]);

    // Simulate scanning progress
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setResults(mockResults);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
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
              Dark Web Scanner
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Advanced monitoring of dark web marketplaces for stolen or unauthorized art sales
            </p>
          </div>

          {/* Scan Control */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Deep Web Surveillance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Scan across 1,200+ dark web marketplaces and forums
                </div>
                <Button 
                  onClick={startScan} 
                  disabled={isScanning}
                  className="flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  {isScanning ? 'Scanning...' : 'Start Deep Scan'}
                </Button>
              </div>
              
              {isScanning && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Scanning marketplaces...</span>
                    <span>{scanProgress}%</span>
                  </div>
                  <Progress value={scanProgress} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          {results.length > 0 && (
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
                          <div className="text-2xl font-bold">3</div>
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
                          <div className="text-2xl font-bold">12</div>
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
                          <div className="text-2xl font-bold">1,200+</div>
                          <div className="text-xs text-muted-foreground">Marketplaces</div>
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
                    {results.map((result) => (
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
                    ))}
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
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <div className="font-medium">Full Deep Web Scan</div>
                            <div className="text-sm text-muted-foreground">January 8, 2024 - 14:32</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">3 threats found</div>
                            <div className="text-sm text-muted-foreground">1,200 marketplaces scanned</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <div className="font-medium">Targeted Scan</div>
                            <div className="text-sm text-muted-foreground">January 7, 2024 - 09:15</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">1 threat found</div>
                            <div className="text-sm text-muted-foreground">850 marketplaces scanned</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <DailyReport type="deep-scan" />
                </div>
              </TabsContent>
            </Tabs>
          )}

          {/* Empty State */}
          {!isScanning && results.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Recent Scans</h3>
                <p className="text-muted-foreground mb-6">
                  Start a deep web scan to monitor for unauthorized use of your artwork
                </p>
                <Button onClick={startScan} className="flex items-center gap-2 mx-auto">
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