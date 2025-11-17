import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Image, Download, Shield, User, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UserInfo {
  id: string;
  email: string;
}

interface ArtworkRecord {
  id: string;
  title: string;
  category: string;
  user_id: string;
  created_at: string;
  file_size: number | null;
  status: string | null;
  ai_protection_enabled: boolean | null;
}

interface ProtectionRecord {
  id: string;
  original_filename: string;
  content_type: string;
  protection_level: string;
  user_id: string;
  created_at: string;
  file_fingerprint: string;
}

interface ScanResult {
  id: string;
  image_url: string;
  total_matches: number;
  threat_level: string;
  user_id: string;
  created_at: string;
}

export default function AllUploadsAndScans() {
  const [artworks, setArtworks] = useState<ArtworkRecord[]>([]);
  const [protectionRecords, setProtectionRecords] = useState<ProtectionRecord[]>([]);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [userEmails, setUserEmails] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Load all artwork uploads
      const { data: artworkData, error: artworkError } = await supabase
        .from('artwork')
        .select('id, title, category, user_id, created_at, file_size, status, ai_protection_enabled')
        .order('created_at', { ascending: false })
        .limit(100);

      if (artworkError) throw artworkError;
      setArtworks(artworkData || []);

      // Load all AI protection records
      const { data: protectionData, error: protectionError } = await supabase
        .from('ai_protection_records')
        .select('id, original_filename, content_type, protection_level, user_id, created_at, file_fingerprint')
        .order('created_at', { ascending: false })
        .limit(100);

      if (protectionError) throw protectionError;
      setProtectionRecords(protectionData || []);

      // Load all scan results
      const { data: scanData, error: scanError } = await supabase
        .from('copyright_scan_results')
        .select('id, image_url, total_matches, threat_level, user_id, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (scanError) throw scanError;
      setScanResults(scanData || []);

      // Fetch user emails and names from admin-user-details edge function
      const uniqueUserIds = new Set<string>();
      artworkData?.forEach(a => uniqueUserIds.add(a.user_id));
      protectionData?.forEach(p => uniqueUserIds.add(p.user_id));
      scanData?.forEach(s => uniqueUserIds.add(s.user_id));

      const nameMap: Record<string, string> = {};
      const emailMap: Record<string, string> = {};
      
      for (const userId of Array.from(uniqueUserIds)) {
        try {
          const { data: userData } = await supabase.functions.invoke('admin-user-details', {
            body: { userId }
          });
          if (userData) {
            nameMap[userId] = userData.full_name || userData.email || 'Unknown User';
            emailMap[userId] = userData.email || 'No email';
          }
        } catch (err) {
          console.error(`Error fetching user ${userId}:`, err);
          nameMap[userId] = 'Unknown User';
          emailMap[userId] = 'Unknown';
        }
      }
      setUserNames(nameMap);
      setUserEmails(emailMap);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load uploads and scans data');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderUserInfo = (userId: string) => {
    const name = userNames[userId] || 'Loading...';
    const email = userEmails[userId];
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => copyToClipboard(userId)}
              >
                {copiedId === userId ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-mono text-xs">User ID: {userId}</p>
            {email && <p className="text-xs mt-1">Email: {email}</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const getThreatBadgeVariant = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Uploads & Scans</CardTitle>
          <CardDescription>Loading data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Uploads & Scans (All Users)</CardTitle>
        <CardDescription>View all uploads, protected documents, and scan results across the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="artworks">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="artworks">
              <Image className="h-4 w-4 mr-2" />
              Artworks ({artworks.length})
            </TabsTrigger>
            <TabsTrigger value="protected">
              <Shield className="h-4 w-4 mr-2" />
              Protected Docs ({protectionRecords.length})
            </TabsTrigger>
            <TabsTrigger value="scans">
              <FileText className="h-4 w-4 mr-2" />
              Scans ({scanResults.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="artworks" className="mt-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>File Size</TableHead>
                    <TableHead>Protection</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {artworks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No artwork uploads found
                      </TableCell>
                    </TableRow>
                  ) : (
                    artworks.map((artwork) => (
                      <TableRow key={artwork.id}>
                        <TableCell className="font-medium">{artwork.title}</TableCell>
                        <TableCell>{artwork.category}</TableCell>
                        <TableCell>{renderUserInfo(artwork.user_id)}</TableCell>
                        <TableCell>{formatFileSize(artwork.file_size)}</TableCell>
                        <TableCell>
                          {artwork.ai_protection_enabled ? (
                            <Badge variant="default">
                              <Shield className="h-3 w-3 mr-1" />
                              Protected
                            </Badge>
                          ) : (
                            <Badge variant="outline">None</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={artwork.status === 'active' ? 'default' : 'secondary'}>
                            {artwork.status || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(artwork.created_at), 'MMM d, yyyy')}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="protected" className="mt-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Filename</TableHead>
                    <TableHead>Content Type</TableHead>
                    <TableHead>Protection Level</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Fingerprint</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {protectionRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No protected documents found
                      </TableCell>
                    </TableRow>
                  ) : (
                    protectionRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.original_filename}</TableCell>
                        <TableCell>{record.content_type}</TableCell>
                        <TableCell>
                          <Badge variant={record.protection_level === 'maximum' ? 'default' : 'secondary'}>
                            {record.protection_level}
                          </Badge>
                        </TableCell>
                        <TableCell>{renderUserInfo(record.user_id)}</TableCell>
                        <TableCell className="font-mono text-xs">{record.file_fingerprint.slice(0, 12)}...</TableCell>
                        <TableCell>{format(new Date(record.created_at), 'MMM d, yyyy')}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="scans" className="mt-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image URL</TableHead>
                    <TableHead>Total Matches</TableHead>
                    <TableHead>Threat Level</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scanResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No scan results found
                      </TableCell>
                    </TableRow>
                  ) : (
                    scanResults.map((scan) => (
                      <TableRow key={scan.id}>
                        <TableCell className="font-mono text-xs max-w-xs truncate">{scan.image_url}</TableCell>
                        <TableCell>{scan.total_matches}</TableCell>
                        <TableCell>
                          <Badge variant={getThreatBadgeVariant(scan.threat_level)}>
                            {scan.threat_level}
                          </Badge>
                        </TableCell>
                        <TableCell>{renderUserInfo(scan.user_id)}</TableCell>
                        <TableCell>{format(new Date(scan.created_at), 'MMM d, yyyy')}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
