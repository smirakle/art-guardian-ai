import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Gavel,
  FileText,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Send,
  Loader2,
  Download,
  Eye,
  XCircle,
  RefreshCw,
  Scale,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';
import { BugReportButton } from '@/components/BugReportButton';

interface DMCANotice {
  id: string;
  match_id: string | null;
  artwork_id: string | null;
  copyright_owner_name: string;
  copyright_owner_email: string;
  copyright_owner_address: string | null;
  copyright_work_description: string;
  infringing_url: string;
  infringing_description: string | null;
  target_domain: string | null;
  electronic_signature: string | null;
  status: string;
  filed_at: string | null;
  response_received_at: string | null;
  response_status: string | null;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Clock }> = {
  draft: { label: 'Draft', variant: 'secondary', icon: FileText },
  pending: { label: 'Pending', variant: 'default', icon: Clock },
  sent: { label: 'Sent', variant: 'default', icon: Send },
  acknowledged: { label: 'Acknowledged', variant: 'outline', icon: Eye },
  complied: { label: 'Content Removed', variant: 'default', icon: CheckCircle },
  rejected: { label: 'Rejected', variant: 'destructive', icon: XCircle },
  appealed: { label: 'Appealed', variant: 'destructive', icon: RefreshCw },
};

export default function DMCACenter() {
  const { user } = useAuth();
  const [notices, setNotices] = useState<DMCANotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewNotice, setShowNewNotice] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<DMCANotice | null>(null);

  // Form state
  const [form, setForm] = useState({
    copyright_owner_name: '',
    copyright_owner_email: '',
    copyright_owner_address: '',
    copyright_work_description: '',
    infringing_url: '',
    infringing_description: '',
    electronic_signature: '',
  });

  useEffect(() => {
    if (user) fetchNotices();
    else setLoading(false);
  }, [user]);

  const fetchNotices = async () => {
    if (!user) return;
    // dmca_notices doesn't have user_id, but it has artwork_id linked to user's artwork
    const { data: artworks } = await supabase
      .from('artwork')
      .select('id')
      .eq('user_id', user.id);

    if (!artworks?.length) {
      // Also check ai_protection_dmca_notices which has user_id
      const { data: aiNotices } = await supabase
        .from('ai_protection_dmca_notices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setNotices([]);
      setLoading(false);
      return;
    }

    const artworkIds = artworks.map(a => a.id);
    const { data, error } = await supabase
      .from('dmca_notices')
      .select('*')
      .in('artwork_id', artworkIds)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNotices(data as DMCANotice[]);
    }
    setLoading(false);
  };

  const handleSubmitNotice = async () => {
    if (!user) return;
    if (!form.copyright_owner_name || !form.copyright_owner_email || !form.infringing_url || !form.copyright_work_description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      // Extract domain from URL
      let targetDomain = '';
      try {
        targetDomain = new URL(form.infringing_url).hostname;
      } catch { targetDomain = form.infringing_url; }

      // Must have at least one artwork for RLS to allow the insert
      const { data: userArtwork } = await supabase
        .from('artwork')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (!userArtwork) {
        toast.error('You need to upload at least one artwork before filing a DMCA notice.');
        setSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from('dmca_notices')
        .insert({
          artwork_id: userArtwork.id,
          match_id: userArtwork.id, // placeholder — not tied to a specific match
          copyright_owner_name: form.copyright_owner_name,
          copyright_owner_email: form.copyright_owner_email,
          copyright_owner_address: form.copyright_owner_address || '',
          copyright_work_description: form.copyright_work_description,
          infringing_url: form.infringing_url,
          infringing_description: form.infringing_description || '',
          target_domain: targetDomain,
          electronic_signature: form.electronic_signature || form.copyright_owner_name,
          status: 'draft',
        });

      if (error) throw error;

      toast.success('DMCA notice created');
      setShowNewNotice(false);
      setForm({
        copyright_owner_name: '',
        copyright_owner_email: '',
        copyright_owner_address: '',
        copyright_work_description: '',
        infringing_url: '',
        infringing_description: '',
        electronic_signature: '',
      });
      fetchNotices();
    } catch (err: any) {
      toast.error('Failed to create notice: ' + (err.message || 'Unknown error'));
    }
    setSubmitting(false);
  };

  const generateNoticeText = (notice: DMCANotice) => {
    return `DMCA TAKEDOWN NOTICE

To Whom It May Concern:

I, ${notice.copyright_owner_name}, am the copyright owner of the work described below. I have a good faith belief that the use of the material described below is not authorized by the copyright owner, its agent, or the law.

COPYRIGHTED WORK:
${notice.copyright_work_description}

INFRINGING MATERIAL:
URL: ${notice.infringing_url}
${notice.infringing_description ? `Description: ${notice.infringing_description}` : ''}

I swear, under penalty of perjury, that the information in this notification is accurate and that I am the copyright owner, or am authorized to act on behalf of the owner, of an exclusive right that is allegedly infringed.

Contact Information:
Name: ${notice.copyright_owner_name}
Email: ${notice.copyright_owner_email}
${notice.copyright_owner_address ? `Address: ${notice.copyright_owner_address}` : ''}

${notice.electronic_signature ? `Electronic Signature: ${notice.electronic_signature}` : ''}

Date: ${format(new Date(notice.created_at), 'MMMM d, yyyy')}`;
  };

  const handleDownloadNotice = (notice: DMCANotice) => {
    const text = generateNoticeText(notice);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DMCA-Notice-${notice.id.substring(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = {
    total: notices.length,
    pending: notices.filter(n => ['pending', 'sent'].includes(n.status)).length,
    resolved: notices.filter(n => n.status === 'complied').length,
    drafts: notices.filter(n => n.status === 'draft').length,
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground text-center">Please sign in to access the DMCA Center.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Gavel className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">DMCA Center</h1>
            <p className="text-muted-foreground">Manage takedown notices and track enforcement actions</p>
          </div>
        </div>
        <Dialog open={showNewNotice} onOpenChange={setShowNewNotice}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> New DMCA Notice</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create DMCA Takedown Notice</DialogTitle>
              <DialogDescription>
                Generate a legally-compliant DMCA takedown notice. All fields marked with * are required.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Copyright Owner Name *</Label>
                  <Input
                    value={form.copyright_owner_name}
                    onChange={(e) => setForm(p => ({ ...p, copyright_owner_name: e.target.value }))}
                    placeholder="Your full legal name"
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={form.copyright_owner_email}
                    onChange={(e) => setForm(p => ({ ...p, copyright_owner_email: e.target.value }))}
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <Label>Mailing Address</Label>
                <Input
                  value={form.copyright_owner_address}
                  onChange={(e) => setForm(p => ({ ...p, copyright_owner_address: e.target.value }))}
                  placeholder="Optional physical address"
                />
              </div>
              <div>
                <Label>Description of Copyrighted Work *</Label>
                <Textarea
                  value={form.copyright_work_description}
                  onChange={(e) => setForm(p => ({ ...p, copyright_work_description: e.target.value }))}
                  placeholder="Describe the original copyrighted work that has been infringed"
                  rows={3}
                />
              </div>
              <Separator />
              <div>
                <Label>Infringing URL *</Label>
                <Input
                  value={form.infringing_url}
                  onChange={(e) => setForm(p => ({ ...p, infringing_url: e.target.value }))}
                  placeholder="https://example.com/infringing-content"
                />
              </div>
              <div>
                <Label>Description of Infringement</Label>
                <Textarea
                  value={form.infringing_description}
                  onChange={(e) => setForm(p => ({ ...p, infringing_description: e.target.value }))}
                  placeholder="Describe how your work is being used without authorization"
                  rows={2}
                />
              </div>
              <Separator />
              <div>
                <Label>Electronic Signature</Label>
                <Input
                  value={form.electronic_signature}
                  onChange={(e) => setForm(p => ({ ...p, electronic_signature: e.target.value }))}
                  placeholder="Type your full name as digital signature"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  By signing, you certify under penalty of perjury that you are the copyright owner or authorized agent.
                </p>
              </div>
              <Button onClick={handleSubmitNotice} disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                Create Notice
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Notices', value: stats.total, icon: Scale, color: 'text-primary' },
          { label: 'Drafts', value: stats.drafts, icon: FileText, color: 'text-muted-foreground' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-500' },
          { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'text-green-500' },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Notices List */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({notices.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({stats.pending})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({stats.resolved})</TabsTrigger>
        </TabsList>

        {['all', 'active', 'resolved'].map(tab => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}><CardContent className="p-4"><Skeleton className="h-20 w-full" /></CardContent></Card>
              ))
            ) : (
              (() => {
                const filtered = tab === 'all' ? notices
                  : tab === 'active' ? notices.filter(n => ['draft', 'pending', 'sent', 'acknowledged'].includes(n.status))
                  : notices.filter(n => ['complied', 'rejected'].includes(n.status));

                if (filtered.length === 0) {
                  return (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">
                          {tab === 'all' ? 'No DMCA notices yet. Create one when you find unauthorized use of your content.' : `No ${tab} notices.`}
                        </p>
                      </CardContent>
                    </Card>
                  );
                }

                return filtered.map(notice => {
                  const config = statusConfig[notice.status] || statusConfig.draft;
                  const StatusIcon = config.icon;
                  return (
                    <Card key={notice.id} className="hover:border-primary/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={config.variant} className="text-xs">
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {config.label}
                              </Badge>
                              {notice.target_domain && (
                                <span className="text-sm text-muted-foreground truncate">{notice.target_domain}</span>
                              )}
                            </div>
                            <p className="text-sm font-medium truncate">{notice.copyright_work_description}</p>
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {notice.infringing_url}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Created {formatDistanceToNow(new Date(notice.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedNotice(notice)}
                            >
                              <Eye className="h-3 w-3 mr-1" /> View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadNotice(notice)}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                });
              })()
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Notice Detail Dialog */}
      <Dialog open={!!selectedNotice} onOpenChange={() => setSelectedNotice(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedNotice && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Gavel className="h-5 w-5" />
                  DMCA Notice Details
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-2">
                  <Badge variant={statusConfig[selectedNotice.status]?.variant || 'secondary'}>
                    {statusConfig[selectedNotice.status]?.label || selectedNotice.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    ID: {selectedNotice.id.substring(0, 8)}
                  </span>
                </div>

                <div className="grid gap-3">
                  <div>
                    <Label className="text-muted-foreground text-xs">Copyright Owner</Label>
                    <p className="text-sm font-medium">{selectedNotice.copyright_owner_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedNotice.copyright_owner_email}</p>
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-muted-foreground text-xs">Copyrighted Work</Label>
                    <p className="text-sm">{selectedNotice.copyright_work_description}</p>
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-muted-foreground text-xs">Infringing URL</Label>
                    <a href={selectedNotice.infringing_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary flex items-center gap-1 hover:underline">
                      {selectedNotice.infringing_url} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  {selectedNotice.infringing_description && (
                    <div>
                      <Label className="text-muted-foreground text-xs">Infringement Description</Label>
                      <p className="text-sm">{selectedNotice.infringing_description}</p>
                    </div>
                  )}
                  <Separator />
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Created: {format(new Date(selectedNotice.created_at), 'MMM d, yyyy')}</span>
                    {selectedNotice.filed_at && <span>Filed: {format(new Date(selectedNotice.filed_at), 'MMM d, yyyy')}</span>}
                    {selectedNotice.response_received_at && <span>Response: {format(new Date(selectedNotice.response_received_at), 'MMM d, yyyy')}</span>}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => handleDownloadNotice(selectedNotice)}>
                    <Download className="h-4 w-4 mr-2" /> Download Notice
                  </Button>
                  <Button variant="outline" onClick={() => {
                    navigator.clipboard.writeText(generateNoticeText(selectedNotice));
                    toast.success('Notice text copied to clipboard');
                  }}>
                    Copy Text
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <BugReportButton />
    </div>
  );
}
