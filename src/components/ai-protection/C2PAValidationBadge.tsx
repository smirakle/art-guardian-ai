import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShieldAlert, Loader2, FileSearch } from 'lucide-react';
import { validateC2PAManifest, logC2PAValidation, C2PAValidationResult } from '@/lib/c2paValidation';
import { useAuth } from '@/contexts/AuthContext';

interface C2PAValidationBadgeProps {
  file: File | null;
  onValidationComplete?: (result: C2PAValidationResult) => void;
  autoValidate?: boolean;
  compact?: boolean;
}

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

      // Log for compliance
      if (user?.id) {
        await logC2PAValidation(user.id, file.name, file.type, res.hasC2PA, {
          claimGenerator: res.claimGenerator,
          assertions: res.assertions,
          rawBoxCount: res.rawBoxCount,
          format: res.format,
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

  if (!file) return null;

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

  if (compact) {
    return result.hasC2PA ? (
      <Badge variant="default" className="gap-1 text-xs bg-green-600 hover:bg-green-700">
        <ShieldCheck className="h-3 w-3" />
        C2PA Verified
      </Badge>
    ) : (
      <Badge variant="outline" className="gap-1 text-xs text-muted-foreground">
        No C2PA
      </Badge>
    );
  }

  if (result.hasC2PA) {
    return (
      <Alert className="border-green-500/50 bg-green-500/5">
        <ShieldCheck className="h-4 w-4 text-green-600" />
        <AlertDescription className="space-y-1">
          <div className="font-medium text-sm">
            Content Credentials Detected (C2PA)
          </div>
          {result.claimGenerator && (
            <div className="text-xs text-muted-foreground">
              Source: {result.claimGenerator}
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
          <div className="text-xs text-muted-foreground mt-1">
            Applying TSMO protection will add a new entry to the provenance chain.
          </div>
        </AlertDescription>
      </Alert>
    );
  }

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
