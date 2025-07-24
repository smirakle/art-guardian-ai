import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, Shield, User, Calendar, Filter, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface SecurityAuditEntry {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: any;
  ip_address: unknown;
  user_agent: unknown;
  created_at: string;
  profiles?: {
    full_name: string;
    username: string;
  } | null;
}

const SecurityAuditLog: React.FC = () => {
  const [auditEntries, setAuditEntries] = useState<SecurityAuditEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<SecurityAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  useEffect(() => {
    fetchAuditEntries();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('security_audit_log_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'security_audit_log' },
        () => {
          fetchAuditEntries();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    filterEntries();
  }, [auditEntries, searchTerm, actionFilter]);

  const fetchAuditEntries = async () => {
    try {
      // Fetch audit entries
      const { data: auditData, error: auditError } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (auditError) throw auditError;

      // Get unique user IDs
      const userIds = [...new Set(auditData?.map(entry => entry.user_id).filter(Boolean))] as string[];
      
      let profilesMap = new Map();
      
      // Fetch profiles for users if we have user IDs
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, username')
          .in('user_id', userIds);

        if (!profilesError && profilesData) {
          profilesMap = new Map(profilesData.map(profile => [profile.user_id, profile]));
        }
      }

      // Combine audit entries with profile data
      const enrichedEntries: SecurityAuditEntry[] = auditData?.map(entry => ({
        ...entry,
        profiles: entry.user_id ? profilesMap.get(entry.user_id) || null : null
      })) || [];

      setAuditEntries(enrichedEntries);
    } catch (error: any) {
      console.error('Error fetching security audit entries:', error);
      toast({
        title: "Error",
        description: "Failed to load security audit log",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterEntries = () => {
    let filtered = auditEntries;

    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(entry.ip_address || '').includes(searchTerm)
      );
    }

    if (actionFilter !== 'all') {
      filtered = filtered.filter(entry => entry.action === actionFilter);
    }

    setFilteredEntries(filtered);
  };

  const exportAuditLog = () => {
    const csvHeaders = ['Timestamp', 'User', 'Action', 'Resource Type', 'Resource ID', 'IP Address', 'Details'];
    const csvData = filteredEntries.map(entry => [
      format(new Date(entry.created_at), 'yyyy-MM-dd HH:mm:ss'),
      entry.profiles?.full_name || entry.profiles?.username || 'System',
      entry.action,
      entry.resource_type,
      entry.resource_id || '',
      String(entry.ip_address || ''),
      JSON.stringify(entry.details)
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('failed') || action.includes('unauthorized')) {
      return 'destructive';
    }
    if (action.includes('role_change') || action.includes('admin')) {
      return 'default';
    }
    return 'secondary';
  };

  const getActionIcon = (action: string) => {
    if (action.includes('unauthorized') || action.includes('failed')) {
      return <AlertCircle className="h-4 w-4" />;
    }
    if (action.includes('role') || action.includes('admin')) {
      return <Shield className="h-4 w-4" />;
    }
    return <User className="h-4 w-4" />;
  };

  const uniqueActions = [...new Set(auditEntries.map(entry => entry.action))].sort();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading security audit log...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Audit Log
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor security events and administrative actions
            </p>
          </div>
          <Button onClick={exportAuditLog} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by action, user, or IP address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {uniqueActions.map((action) => (
                <SelectItem key={action} value={action}>
                  {action.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-2xl font-bold">{filteredEntries.length}</div>
            <div className="text-sm text-muted-foreground">Total Events</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-2xl font-bold">
              {filteredEntries.filter(e => e.action.includes('unauthorized')).length}
            </div>
            <div className="text-sm text-muted-foreground">Unauthorized Attempts</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-2xl font-bold">
              {filteredEntries.filter(e => e.action.includes('role_change')).length}
            </div>
            <div className="text-sm text-muted-foreground">Role Changes</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-2xl font-bold">
              {new Set(filteredEntries.map(e => e.ip_address)).size}
            </div>
            <div className="text-sm text-muted-foreground">Unique IPs</div>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {searchTerm || actionFilter !== 'all' 
                        ? 'No audit entries match your filters' 
                        : 'No security audit entries found'
                      }
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(entry.created_at), 'MMM dd, HH:mm')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {entry.profiles?.full_name || entry.profiles?.username || 'System'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getActionBadgeVariant(entry.action)} className="flex items-center gap-1">
                        {getActionIcon(entry.action)}
                        {entry.action.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{entry.resource_type}</div>
                        {entry.resource_id && (
                          <div className="text-muted-foreground truncate max-w-32">
                            {entry.resource_id}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {String(entry.ip_address || 'unknown')}
                      </code>
                    </TableCell>
                    <TableCell>
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          View details
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-w-xs">
                          {JSON.stringify(entry.details, null, 2)}
                        </pre>
                      </details>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityAuditLog;