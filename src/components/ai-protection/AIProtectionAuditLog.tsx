import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Search, FileText, Shield, AlertTriangle, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AuditLogEntry {
  id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details: any;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}

const AIProtectionAuditLog = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    loadAuditLogs();
  }, [searchTerm, actionFilter]);

  const loadAuditLogs = async () => {
    try {
      let query = supabase
        .from('ai_protection_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      if (searchTerm) {
        query = query.or(`action.ilike.%${searchTerm}%,resource_type.ilike.%${searchTerm}%,details::text.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAuditLogs((data || []).map(log => ({
        ...log,
        ip_address: log.ip_address as string | null,
        user_agent: log.user_agent as string | null
      })));
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create_protection_record':
        return <Shield className="h-4 w-4 text-green-500" />;
      case 'violation_detected':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'violation_status_update':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'update_protection_record':
        return <FileText className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionVariant = (action: string) => {
    switch (action) {
      case 'create_protection_record':
        return 'default';
      case 'violation_detected':
        return 'destructive';
      case 'violation_status_update':
        return 'secondary';
      case 'update_protection_record':
        return 'outline';
      default:
        return 'secondary';
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
          <CardTitle className="text-2xl">Audit Log</CardTitle>
          <CardDescription>Track all AI protection activities and changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-4 p-4 rounded-lg border animate-pulse">
                <div className="h-4 w-4 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Audit Log</CardTitle>
        <CardDescription>Track all AI protection activities and changes</CardDescription>
        
        <div className="flex gap-4 mt-4">
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
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="create_protection_record">Create Protection</SelectItem>
              <SelectItem value="violation_detected">Violation Detected</SelectItem>
              <SelectItem value="violation_status_update">Status Update</SelectItem>
              <SelectItem value="update_protection_record">Update Protection</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {auditLogs.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No audit logs found</h3>
            <p className="text-muted-foreground">No activities match your current filters.</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getActionVariant(log.action)} className="text-xs">
                            {formatActionName(log.action)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {log.resource_type}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {log.details && Object.keys(log.details).length > 0 && (
                            <div className="space-y-1">
                              {Object.entries(log.details).map(([key, value]) => (
                                <div key={key} className="flex gap-2">
                                  <span className="font-medium">{key}:</span>
                                  <span>{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {log.resource_id && (
                            <div className="text-xs font-mono bg-muted px-2 py-1 rounded">
                              ID: {log.resource_id}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground ml-4">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    {log.ip_address && (
                      <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                        <span>IP: {log.ip_address}</span>
                        {log.user_agent && (
                          <span className="truncate">• {log.user_agent.substring(0, 50)}...</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default AIProtectionAuditLog;