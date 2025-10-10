import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useAutomatedDMCA } from '@/hooks/useAutomatedDMCA';
import { 
  FileText, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Activity
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const AutomatedDMCADashboard = () => {
  const { 
    takedowns, 
    loading, 
    updateTakedownStatus, 
    getTakedownStats 
  } = useAutomatedDMCA();

  const stats = getTakedownStats();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'sent':
        return <Send className="h-4 w-4" />;
      case 'acknowledged':
        return <Activity className="h-4 w-4" />;
      case 'complied':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'complied':
        return 'default';
      case 'sent':
      case 'acknowledged':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Takedowns</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending + stats.sent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complied</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.complied}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.complianceRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Takedowns List */}
      <Card>
        <CardHeader>
          <CardTitle>DMCA Takedown Notices</CardTitle>
          <CardDescription>
            Automated copyright infringement takedown requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {takedowns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No DMCA takedowns initiated yet</p>
              <p className="text-sm mt-2">
                Takedowns will appear here when violations are detected
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {takedowns.map((takedown) => (
                  <Card key={takedown.id} className="border-l-4" style={{
                    borderLeftColor: takedown.status === 'complied' ? 'hsl(var(--primary))' :
                                    takedown.status === 'rejected' ? 'hsl(var(--destructive))' :
                                    'hsl(var(--muted))'
                  }}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(takedown.status)}
                            <CardTitle className="text-base">
                              {takedown.platform}
                            </CardTitle>
                            <Badge variant={getStatusVariant(takedown.status)}>
                              {takedown.status}
                            </Badge>
                          </div>
                          <CardDescription className="text-xs break-all">
                            {takedown.takedown_url || 'No URL provided'}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Filed</p>
                            <p className="font-medium">
                              {takedown.filed_at 
                                ? formatDistanceToNow(new Date(takedown.filed_at), { addSuffix: true })
                                : 'Not filed'}
                            </p>
                          </div>
                          {takedown.reference_number && (
                            <div>
                              <p className="text-muted-foreground">Reference</p>
                              <p className="font-medium text-xs">
                                {takedown.reference_number}
                              </p>
                            </div>
                          )}
                        </div>

                        {takedown.status === 'filed' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateTakedownStatus(takedown.id, 'acknowledged')}
                            >
                              Mark Acknowledged
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => updateTakedownStatus(takedown.id, 'complied')}
                            >
                              Mark Complied
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateTakedownStatus(takedown.id, 'rejected')}
                            >
                              Mark Rejected
                            </Button>
                          </div>
                        )}

                        {takedown.metadata?.notice && (
                          <Button variant="link" size="sm" className="p-0 h-auto">
                            <FileText className="h-3 w-3 mr-1" />
                            View Notice Details
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
