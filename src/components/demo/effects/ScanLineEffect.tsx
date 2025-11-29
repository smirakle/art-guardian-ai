interface ScanLineEffectProps {
  active: boolean;
}

export const ScanLineEffect = ({ active }: ScanLineEffectProps) => {
  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/30 to-transparent h-12 animate-scan-down" />
    </div>
  );
};
