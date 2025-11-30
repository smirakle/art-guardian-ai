import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, FileUp, CheckCircle2, Clock, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GuestUpload {
  id: string;
  session_id: string;
  file_name: string;
  file_size: number;
  content_type: string;
  protection_level: string | null;
  created_at: string | null;
  expires_at: string | null;
  converted_at: string | null;
  converted_to_user_id: string | null;
}

const GuestUploadsTracking = () => {
  const [uploads, setUploads] = useState<GuestUpload[]>([]);
  const [filteredUploads, setFilteredUploads] = useState<GuestUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    converted: 0,
    expired: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchGuestUploads();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('guest_uploads_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'guest_uploads' 
      }, () => {
        fetchGuestUploads();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const filtered = uploads.filter(upload => 
      upload.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      upload.session_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      upload.content_type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUploads(filtered);
  }, [searchTerm, uploads]);

  const fetchGuestUploads = async () => {
    try {
      const { data, error } = await supabase
        .from('guest_uploads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUploads(data || []);
      
      // Calculate stats
      const now = new Date();
      const total = data?.length || 0;
      const converted = data?.filter(u => u.converted_at !== null).length || 0;
      const expired = data?.filter(u => u.expires_at && new Date(u.expires_at) < now).length || 0;
      const active = total - converted - expired;

      setStats({ total, active, converted, expired });
    } catch (error: any) {
      console.error('Error fetching guest uploads:', error);
      toast({
        title: "Error",
        description: "Failed to fetch guest upload data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatus = (upload: GuestUpload) => {
    if (upload.converted_at) return { label: 'Converted', variant: 'default' as const };
    if (upload.expires_at && new Date(upload.expires_at) < new Date()) return { label: 'Expired', variant: 'secondary' as const };
    return { label: 'Active', variant: 'outline' as const };
  };

  const exportToCSV = () => {
    const headers = ['Session ID', 'File Name', 'Size', 'Type', 'Protection Level', 'Created', 'Status', 'Converted'];
    const rows = filteredUploads.map(u => [
      u.session_id,
      u.file_name,
      formatFileSize(u.file_size),
      u.content_type,
      u.protection_level || 'N/A',
      u.created_at ? new Date(u.created_at).toLocaleString() : 'N/A',
      getStatus(u).label,
      u.converted_at ? new Date(u.converted_at).toLocaleString() : 'Not converted'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `guest-uploads-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading guest uploads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Guest Upload Tracking</h2>
        <p className="text-muted-foreground">Monitor uploads from users who haven't signed in</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Uploads</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <FileUp className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <Clock className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Converted</p>
              <p className="text-2xl font-bold text-blue-600">{stats.converted}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Expired</p>
              <p className="text-2xl font-bold text-muted-foreground">{stats.expired}</p>
            </div>
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Filters and Export */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by filename, session ID, or type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Uploads Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session ID</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Protection</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUploads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No guest uploads found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUploads.map((upload) => {
                  const status = getStatus(upload);
                  return (
                    <TableRow key={upload.id}>
                      <TableCell className="font-mono text-xs">
                        {upload.session_id.substring(0, 16)}...
                      </TableCell>
                      <TableCell className="font-medium">{upload.file_name}</TableCell>
                      <TableCell>{formatFileSize(upload.file_size)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{upload.content_type}</Badge>
                      </TableCell>
                      <TableCell>
                        {upload.protection_level ? (
                          <Badge>{upload.protection_level}</Badge>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {upload.created_at ? new Date(upload.created_at).toLocaleString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {upload.expires_at ? new Date(upload.expires_at).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default GuestUploadsTracking;
