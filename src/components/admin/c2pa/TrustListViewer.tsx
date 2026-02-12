import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';
import { getTrustList, clearTrustListCache, TrustListData, TrustAnchor } from '@/lib/c2paTrustList';

const TrustListViewer: React.FC = () => {
  const [trustList, setTrustList] = useState<TrustListData | null>(null);
  const [loading, setLoading] = useState(false);

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

  const statusBadge = (anchor: TrustAnchor) => {
    const now = new Date();
    const isExpired = new Date(anchor.validTo) < now;
    if (isExpired || anchor.status === 'expired') {
      return <Badge variant="destructive" className="text-[10px]">Expired</Badge>;
    }
    if (anchor.status === 'revoked') {
      return <Badge variant="destructive" className="text-[10px]">Revoked</Badge>;
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            CAI Trust List
          </CardTitle>
          <CardDescription className="text-xs mt-1">
            Trust anchors from the Content Authenticity Initiative ecosystem for certificate chain validation.
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
            <div className="flex flex-wrap gap-3 mb-4 text-xs text-muted-foreground">
              <span>Version: <strong>{trustList.specVersion}</strong></span>
              <span>Anchors: <strong>{trustList.anchors.length}</strong></span>
              <span>Active: <strong>{trustList.anchors.filter(a => a.status === 'active').length}</strong></span>
              <span>Fetched: <strong>{new Date(trustList.fetchedAt).toLocaleString()}</strong></span>
              {trustList.source && <span>Source: <strong>{trustList.source}</strong></span>}
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Common Name</TableHead>
                    <TableHead className="text-xs">Organization</TableHead>
                    <TableHead className="text-xs">Fingerprint</TableHead>
                    <TableHead className="text-xs">Valid From</TableHead>
                    <TableHead className="text-xs">Valid To</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trustList.anchors.map((anchor, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs font-medium">{anchor.commonName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{anchor.organization}</TableCell>
                      <TableCell className="text-[10px] font-mono text-muted-foreground max-w-[120px] truncate">
                        {anchor.fingerprint.substring(0, 16)}…
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(anchor.validFrom).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(anchor.validTo).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{typeBadge(anchor)}</TableCell>
                      <TableCell>{statusBadge(anchor)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {trustList.source === 'bundled-fallback' && (
              <div className="flex items-center gap-2 mt-3 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                Using bundled fallback. Edge function may be unavailable.
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TrustListViewer;
