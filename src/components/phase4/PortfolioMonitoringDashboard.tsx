import { useEffect, useState } from "react";
import { usePortfolioMonitoring } from "@/hooks/usePortfolioMonitoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Folder,
  Shield,
  AlertTriangle,
  Play,
  CheckCircle,
  TrendingUp,
} from "lucide-react";

interface MonitoringResult {
  id: string;
  total_matches: number;
  high_risk_matches: number;
  medium_risk_matches: number;
  low_risk_matches: number;
  platforms_scanned: string[];
  scan_date: string;
}

interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  created_at: string;
}

export const PortfolioMonitoringDashboard = () => {
  const {
    portfolios,
    loading,
    scanning,
    startPortfolioScan,
    getPortfolioResults,
    getPortfolioAlerts,
  } = usePortfolioMonitoring();

  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);
  const [results, setResults] = useState<MonitoringResult[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    if (portfolios.length > 0 && !selectedPortfolio) {
      setSelectedPortfolio(portfolios[0].id);
    }
  }, [portfolios, selectedPortfolio]);

  useEffect(() => {
    if (selectedPortfolio) {
      loadPortfolioData();
    }
  }, [selectedPortfolio]);

  const loadPortfolioData = async () => {
    if (!selectedPortfolio) return;
    
    setLoadingResults(true);
    try {
      const [resultsData, alertsData] = await Promise.all([
        getPortfolioResults(selectedPortfolio),
        getPortfolioAlerts(selectedPortfolio),
      ]);
      setResults(resultsData);
      setAlerts(alertsData);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleStartScan = async () => {
    if (!selectedPortfolio) return;
    
    const platforms = ["google_images", "tineye", "bing_images"];
    await startPortfolioScan(selectedPortfolio, platforms);
    
    // Reload results after scan
    setTimeout(loadPortfolioData, 2000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "warning":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (portfolios.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Portfolios</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create a portfolio to start monitoring your content.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedPortfolioData = portfolios.find((p) => p.id === selectedPortfolio);
  const latestResult = results[0];

  return (
    <div className="space-y-6">
      {/* Portfolio Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{selectedPortfolioData?.name}</h2>
          <p className="text-sm text-muted-foreground">
            {selectedPortfolioData?.description}
          </p>
        </div>
        <Button
          onClick={handleStartScan}
          disabled={scanning}
          className="gap-2"
        >
          <Play className="h-4 w-4" />
          {scanning ? "Scanning..." : "Start Scan"}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.length}</div>
            <p className="text-xs text-muted-foreground">Monitoring sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestResult?.total_matches || 0}
            </div>
            <p className="text-xs text-muted-foreground">From last scan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {latestResult?.high_risk_matches || 0}
            </div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            <p className="text-xs text-muted-foreground">Unread alerts</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Scan Results */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Scan Results</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingResults ? (
            <Skeleton className="h-32 w-full" />
          ) : results.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No scan results yet. Click "Start Scan" to begin monitoring.
            </p>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="border-b pb-4 last:border-0"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {new Date(result.scan_date).toLocaleString()}
                      </span>
                      <Badge variant="outline">
                        {result.platforms_scanned.length} platforms
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      {result.high_risk_matches > 0 && (
                        <Badge variant="destructive">
                          {result.high_risk_matches} high risk
                        </Badge>
                      )}
                      {result.medium_risk_matches > 0 && (
                        <Badge variant="secondary">
                          {result.medium_risk_matches} medium
                        </Badge>
                      )}
                      {result.low_risk_matches > 0 && (
                        <Badge variant="outline">
                          {result.low_risk_matches} low
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {result.platforms_scanned.map((platform) => (
                      <Badge key={platform} variant="outline" className="text-xs">
                        {platform.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start justify-between border-b pb-3 last:border-0"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <p className="font-medium">{alert.title}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
