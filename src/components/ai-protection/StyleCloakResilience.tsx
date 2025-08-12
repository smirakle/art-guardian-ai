import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ShieldCheck, Gauge } from 'lucide-react';

interface Props {
  strength: number; // 0..1
  frequency: number; // 2..16
  colorJitter: number; // 0..1
  useSegmentation: boolean;
}

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export default function StyleCloakResilience({ strength, frequency, colorJitter, useSegmentation }: Props) {
  const [explain, setExplain] = useState(false);

  const score = useMemo(() => {
    // Heuristic: strength 50%, frequency (normalized) 30%, color jitter 15%, segmentation bonus 5%
    const freqNorm = (clamp(frequency, 2, 16) - 2) / 14; // 0..1
    let s = strength * 0.5 + freqNorm * 0.3 + colorJitter * 0.15 + (useSegmentation ? 0.05 : 0);
    s = clamp(s, 0, 1);
    return Math.round(s * 100);
  }, [strength, frequency, colorJitter, useSegmentation]);

  const tier = score >= 85 ? 'High' : score >= 65 ? 'Medium' : 'Baseline';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" /> Resilience Score
        </CardTitle>
        <CardDescription>
          Estimated resistance against model style extraction (beta)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <Gauge className="h-4 w-4" />
          <span className="text-2xl font-semibold">{score}</span>
          <span className="text-muted-foreground">/ 100 • {tier}</span>
        </div>
        <Progress value={score} />
        <button
          className="text-xs text-primary underline"
          onClick={() => setExplain((v) => !v)}
        >
          {explain ? 'Hide details' : 'How is this calculated?'}
        </button>
        {explain && (
          <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
            <li>Strength: {Math.round(strength * 100)}% weight (50%)</li>
            <li>Frequency: {Math.round(((clamp(frequency,2,16)-2)/14)*100)}% weight (30%)</li>
            <li>Color jitter: {Math.round(colorJitter * 100)}% weight (15%)</li>
            <li>Segmentation bonus: {useSegmentation ? '+5%' : '0%'}</li>
          </ul>
        )}
        <p className="text-xs text-muted-foreground">
          Beta: Scores are indicative, not guarantees. Visual quality varies by content.
        </p>
      </CardContent>
    </Card>
  );
}
