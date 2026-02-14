import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShieldAlert, Loader2, FileSearch, Film, AlertTriangle, Info } from 'lucide-react';
import { validateC2PAManifest, logC2PAValidation, C2PAValidationResult, isC2PASupportedType } from '@/lib/c2paValidation';
import { useAuth } from '@/contexts/AuthContext';

interface C2PAValidationBadgeProps {
  file: File | null;
  onValidationComplete?: (result: C2PAValidationResult) => void;
  autoValidate?: boolean;
  compact?: boolean;
}

const TRUST_STATUS_CONFIG: Record<string, { label: string; className: string; compactClassName: string }> = {
  trusted: {
    label: 'Trusted',
    className: 'bg-green-600 hover:bg-green-700 text-white border-transparent',
    compactClassName: 'bg-green-600 hover:bg-green-700',
  },
  'self-signed': {
    label: 'Self-Signed',
    className: 'bg-yellow-500 hover:bg-yellow-600 text-white border-transparent',
    compactClassName: 'bg-yellow-500 hover:bg-yellow-600',
  },
  expired: {
    label: 'Expired',
    className: 'bg-orange-500 hover:bg-orange-600 text-white border-transparent',
    compactClassName: 'bg-orange-500 hover:bg-orange-600',
  },
  untrusted: {
    label: 'Untrusted',
    className: 'bg-muted text-muted-foreground border-border',
    compactClassName: 'bg-muted',
  },
  unknown: {
    label: 'Unknown Trust',
    className: 'bg-muted text-muted-foreground border-border',
    compactClassName: 'bg-muted',
  },
};

const C2PAValidationBadge: React.FC<C2PAValidationBadgeProps> = ({
  file,
  onValidationComplete,
  autoValidate = false,
  compact = false,
}) => {
  const { user } = useAuth();
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<C2PAValidationResult | null>(null);

  const runValidation = async () => {
    if (!file) return;
    setValidating(true);
    try {
      const res = await validateC2PAManifest(file);
      setResult(res);
      onValidationComplete?.(res);

      // Log for compliance — full data matching conformance side
      if (user?.id) {
        await logC2PAValidation(user.id, file.name, file.type, res.hasC2PA, {
          claimGenerator: res.claimGenerator,
          claimGeneratorInfo: res.claimGeneratorInfo,
          assertions: res.assertions,
          ingredients: res.ingredients,
          trustStatus: res.trustStatus,
          trustReason: res.trustReason,
          specVersion: res.specVersion,
          rawBoxCount: res.rawBoxCount,
          format: res.format,
          error: res.error,
        });
      }
    } catch (e) {
      console.error('[C2PAValidationBadge] Error:', e);
    } finally {
      setValidating(false);
    }
  };

  // Auto-validate when file changes
  React.useEffect(() => {
    if (autoValidate && file) {
      setResult(null);
      runValidation();
    }
  }, [file, autoValidate]);

  if (!file || !isC2PASupportedType(file.type)) return null;

  const isVideo = file.type.startsWith('video/');

  if (validating) {
    return (
      <Badge variant="outline" className="gap-1 text-xs">
        <Loader2 className="h-3 w-3 animate-spin" />
        Checking C2PA…
      </Badge>
    );
  }

  if (!result && !autoValidate) {
    return (
      <Button variant="ghost" size="sm" onClick={runValidation} className="text-xs h-7 gap-1">
        <FileSearch className="h-3 w-3" />
        Check C2PA
      </Button>
    );
  }

  if (!result) return null;

  const trustConfig = TRUST_STATUS_CONFIG[result.trustStatus] || TRUST_STATUS_CONFIG.unknown;

  // --- Compact view ---
  if (compact) {
    return result.hasC2PA ? (
      <Badge variant="default" className={`gap-1 text-xs ${trustConfig.compactClassName}`}>
        <ShieldCheck className="h-3 w-3" />
        C2PA {trustConfig.label}
      </Badge>
    ) : (
      <Badge variant="outline" className="gap-1 text-xs text-muted-foreground">
        No C2PA
      </Badge>
    );
  }

  // --- Full view: C2PA found ---
  if (result.hasC2PA) {
    const borderColor = result.trustStatus === 'trusted' ? 'border-green-500/50' : result.trustStatus === 'self-signed' ? 'border-yellow-500/50' : result.trustStatus === 'expired' ? 'border-orange-500/50' : 'border-muted';
    const bgColor = result.trustStatus === 'trusted' ? 'bg-green-500/5' : result.trustStatus === 'self-signed' ? 'bg-yellow-500/5' : result.trustStatus === 'expired' ? 'bg-orange-500/5' : 'bg-muted/20';

    return (
      <Alert className={`${borderColor} ${bgColor}`}>
        <ShieldCheck className="h-4 w-4 text-green-600" />
        <AlertDescription className="space-y-1">
          <div className="font-medium text-sm flex items-center gap-1.5 flex-wrap">
            {isVideo && <Film className="h-3 w-3" />}
            Content Credentials Detected (C2PA)
            <Badge className={`text-[10px] h-5 ${trustConfig.className}`}>
              {trustConfig.label}
            </Badge>
          </div>

          {result.claimGenerator && (
            <div className="text-xs text-muted-foreground">
              Source: {result.claimGenerator}
            </div>
          )}

          {/* Spec version & generator info */}
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            {result.specVersion && (
              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" />
                C2PA v{result.specVersion}
              </div>
            )}
            {result.claimGeneratorInfo && result.claimGeneratorInfo.length > 0 && (
              <div className="text-[11px] text-muted-foreground">
                {result.claimGeneratorInfo.map((g, i) => (
                  <span key={i}>
                    {g.name}{g.version ? ` v${g.version}` : ''}
                    {i < result.claimGeneratorInfo!.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Trust reason */}
          {result.trustReason && (
            <div className="text-[11px] text-muted-foreground italic">
              {result.trustReason}
            </div>
          )}

          {result.assertions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {result.assertions.map((a, i) => (
                <Badge key={i} variant="outline" className="text-[10px] h-5">
                  {a}
                </Badge>
              ))}
            </div>
          )}

          {result.ingredients && result.ingredients.length > 0 && (
            <div className="mt-1.5 space-y-0.5">
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Ingredients</div>
              {result.ingredients.map((ing, i) => (
                <div key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="font-medium">{ing.title}</span>
                  <span className="text-[10px]">({ing.relationship})</span>
                  {ing.format && <Badge variant="outline" className="text-[9px] h-4 px-1">{ing.format}</Badge>}
                </div>
              ))}
            </div>
          )}

          {/* Partial parse warning */}
          {result.error && (
            <div className="flex items-start gap-1.5 mt-1.5 text-[11px] text-orange-600 dark:text-orange-400">
              <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
              <span>Partial validation: {result.error}</span>
            </div>
          )}

          <div className="text-xs text-muted-foreground mt-1">
            Applying TSMO protection will add a new entry to the provenance chain.
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // --- No C2PA found ---
  return (
    <Alert className="border-muted bg-muted/20">
      <ShieldAlert className="h-4 w-4 text-muted-foreground" />
      <AlertDescription className="text-xs text-muted-foreground">
        No existing C2PA Content Credentials found in this image. TSMO protection can be applied as a new provenance entry.
      </AlertDescription>
    </Alert>
  );
};

export default C2PAValidationBadge;
