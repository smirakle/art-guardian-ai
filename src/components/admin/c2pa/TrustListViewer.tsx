import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RefreshCw, ShieldCheck, AlertTriangle, Loader2, Search } from 'lucide-react';
import { getTrustList, clearTrustListCache, TrustListData, TrustAnchor } from '@/lib/c2paTrustList';

const TrustListViewer: React.FC = () => {
  const [trustList, setTrustList] = useState<TrustListData | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchList = async (forceRefresh = false) => {
    setLoading(true);
    try {
      if (forceRefresh) clearTrustListCache();
      const data = await getTrustList(forceRefresh);
      setTrustList(data);
    } catch (e) {
      console.error('[TrustListViewer] Error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const filteredAnchors = trustList?.anchors.filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.commonName.toLowerCase().includes(q) ||
      a.organization.toLowerCase().includes(q) ||
      (a.country || '').toLowerCase().includes(q) ||
      a.fingerprint.toLowerCase().includes(q)
    );
  }) || [];

  const now = new Date();
  const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  const getRowClass = (anchor: TrustAnchor) => {
    const expiry = new Date(anchor.validTo);
    if (expiry < now || anchor.status === 'expired') return 'bg-destructive/5';
    if (expiry < oneYearFromNow) return 'bg-amber-500/5';
    return '';
  };

  const statusBadge = (anchor: TrustAnchor) => {
    const isExpired = new Date(anchor.validTo) < now;
    if (isExpired || anchor.status === 'expired') {
      return <Badge variant="destructive" className="text-[10px]">Expired</Badge>;
    }
    if (anchor.status === 'revoked') {
      return <Badge variant="destructive" className="text-[10px]">Revoked</Badge>;
    }
    const expiresWithinYear = new Date(anchor.validTo) < oneYearFromNow;
    if (expiresWithinYear) {
      return <Badge variant="outline" className="text-[10px] border-amber-500 text-amber-600">Expiring</Badge>;
    }
    return <Badge variant="default" className="text-[10px] bg-green-600 hover:bg-green-700">Active</Badge>;
  };

  const typeBadge = (anchor: TrustAnchor) => {
    switch (anchor.anchorType) {
      case 'root':
        return <Badge variant="outline" className="text-[10px]">Root</Badge>;
      case 'intermediate':
        return <Badge variant="outline" className="text-[10px]">Intermediate</Badge>;
      case 'end-entity':
        return <Badge variant="secondary" className="text-[10px]">End Entity</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">Unknown</Badge>;
    }
  };

  const sourceBadge = (anchor: TrustAnchor) => {
    const src = anchor.source || 'Unknown';
    if (src.includes('C2PA')) return <Badge variant="default" className="text-[10px]">Official C2PA</Badge>;
    if (src.includes('CAI')) return <Badge variant="secondary" className="text-[10px]">Legacy CAI</Badge>;
    if (src === 'Bundled') return <Badge variant="outline" className="text-[10px]">Bundled</Badge>;
    return <Badge variant="outline" className="text-[10px]">{src}</Badge>;
  };

  // Source counts
  const sourceCounts = trustList?.anchors.reduce((acc, a) => {
    const src = a.source || 'Unknown';
    acc[src] = (acc[src] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            CAI Trust List
          </CardTitle>
          <CardDescription className="text-xs mt-1">
            Live trust anchors fetched from the official C2PA and CAI trust lists for certificate chain validation.
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchList(true)}
          disabled={loading}
          className="gap-1.5"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {!trustList && loading && (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading trust list…
          </div>
        )}

        {trustList && (
          <>
            <div className="flex flex-wrap gap-3 mb-3 text-xs text-muted-foreground">
              <span>Version: <strong>{trustList.specVersion}</strong></span>
              <span>Total: <strong>{trustList.anchors.length}</strong></span>
              <span>Active: <strong>{trustList.anchors.filter(a => a.status === 'active').length}</strong></span>
              {Object.entries(sourceCounts).map(([src, count]) => (
                <span key={src}>{src}: <strong>{count}</strong></span>
              ))}
              <span>Fetched: <strong>{new Date(trustList.fetchedAt).toLocaleString()}</strong></span>
            </div>

            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by name, organization, or country…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>

            <TooltipProvider>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Common Name</TableHead>
                      <TableHead className="text-xs">Organization</TableHead>
                      <TableHead className="text-xs">Country</TableHead>
                      <TableHead className="text-xs">Fingerprint</TableHead>
                      <TableHead className="text-xs">Valid From</TableHead>
                      <TableHead className="text-xs">Valid To</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Source</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAnchors.map((anchor, i) => (
                      <TableRow key={anchor.fingerprint + i} className={getRowClass(anchor)}>
                        <TableCell className="text-xs font-medium">{anchor.commonName}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{anchor.organization || '—'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{anchor.country || '—'}</TableCell>
                        <TableCell className="text-[10px] font-mono text-muted-foreground max-w-[120px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help truncate block">
                                {anchor.fingerprint.substring(0, 16)}…
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="max-w-xs break-all font-mono text-[10px]">
                              {anchor.fingerprint}
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {anchor.validFrom ? new Date(anchor.validFrom).toLocaleDateString() : '—'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {anchor.validTo ? new Date(anchor.validTo).toLocaleDateString() : '—'}
                        </TableCell>
                        <TableCell>{typeBadge(anchor)}</TableCell>
                        <TableCell>{sourceBadge(anchor)}</TableCell>
                        <TableCell>{statusBadge(anchor)}</TableCell>
                      </TableRow>
                    ))}
                    {filteredAnchors.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-xs text-muted-foreground py-6">
                          {search ? 'No anchors match your search.' : 'No anchors loaded.'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TooltipProvider>

            {trustList.source === 'bundled-fallback' && (
              <div className="flex items-center gap-2 mt-3 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                Using bundled fallback. Edge function may be unavailable.
              </div>
            )}

            {trustList.errors && trustList.errors.length > 0 && (
              <div className="flex items-start gap-2 mt-3 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <div>
                  {trustList.errors.map((err, i) => (
                    <div key={i}>{err}</div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TrustListViewer;
