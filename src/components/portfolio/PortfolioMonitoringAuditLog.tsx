import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  PlayCircle, 
  PauseCircle,
  RefreshCw,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/LoadingSpinner';

interface AuditLogEntry {
  id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details: any;
  created_at: string;
}

export const PortfolioMonitoringAuditLog = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const loadAuditLogs = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      let query = supabase
        .from('portfolio_monitoring_audit_log')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (searchTerm) {
        query = query.or(`action.ilike.%${searchTerm}%,resource_type.ilike.%${searchTerm}%`);
      }

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [searchTerm, actionFilter]);

  useEffect(() => {
    // Set up real-time subscription
    const channel = supabase
      .channel('portfolio-monitoring-audit-log')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'portfolio_monitoring_audit_log'
        },
        (payload) => {
          const newLog = payload.new as AuditLogEntry;
          setAuditLogs(prev => [newLog, ...prev.slice(0, 99)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create_portfolio': return <Plus className="h-4 w-4" />;
      case 'update_portfolio': return <Edit className="h-4 w-4" />;
      case 'delete_portfolio': return <Trash2 className="h-4 w-4" />;
      case 'monitoring_scan_completed': return <Activity className="h-4 w-4" />;
      case 'start_monitoring': return <PlayCircle className="h-4 w-4" />;
      case 'stop_monitoring': return <PauseCircle className="h-4 w-4" />;
      case 'view_results': return <Eye className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getActionVariant = (action: string) => {
    switch (action) {
      case 'create_portfolio': return 'default';
      case 'update_portfolio': return 'secondary';
      case 'delete_portfolio': return 'destructive';
      case 'monitoring_scan_completed': return 'outline';
      default: return 'outline';
    }
  };

  const formatActionName = (action: string) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Audit Log
            </CardTitle>
            <CardDescription>
              Track all portfolio monitoring activities and changes
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAuditLogs}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search audit logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="create_portfolio">Create Portfolio</SelectItem>
              <SelectItem value="update_portfolio">Update Portfolio</SelectItem>
              <SelectItem value="delete_portfolio">Delete Portfolio</SelectItem>
              <SelectItem value="monitoring_scan_completed">Scan Completed</SelectItem>
              <SelectItem value="start_monitoring">Start Monitoring</SelectItem>
              <SelectItem value="stop_monitoring">Stop Monitoring</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {auditLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No audit logs found</p>
            <p className="text-sm">Activity logs will appear here as you use the system</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getActionIcon(log.action)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {formatActionName(log.action)}
                        </span>
                        <Badge variant={getActionVariant(log.action)}>
                          {log.resource_type}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {JSON.stringify(log.details, null, 0).slice(0, 100)}...
                        </div>
                      )}
                    </div>
                  </div>
                  {log.resource_id && (
                    <div className="text-xs font-mono text-muted-foreground">
                      ID: {log.resource_id.slice(-8)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};