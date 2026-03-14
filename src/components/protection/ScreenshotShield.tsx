import React, { useRef, useMemo } from 'react';
import { useScreenshotProtection, ScreenshotProtectionConfig } from '@/hooks/useScreenshotProtection';
import { Shield } from 'lucide-react';

interface ScreenshotShieldProps {
  children: React.ReactNode;
  watermarkText?: string;
  config?: Partial<ScreenshotProtectionConfig>;
  enabled?: boolean;
  showWatermark?: boolean;
}

export const ScreenshotShield: React.FC<ScreenshotShieldProps> = ({
  children,
  watermarkText = 'PROTECTED',
  config = {},
  enabled = true,
  showWatermark = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isHidden, interceptCount } = useScreenshotProtection(containerRef, config, enabled);

  const watermarkPattern = useMemo(() => {
    const text = `${watermarkText} • ${new Date().toISOString().split('T')[0]}`;
    const cells = Array.from({ length: 48 }, (_, i) => (
      <span
        key={i}
        className="inline-block whitespace-nowrap text-[10px] tracking-widest"
        style={{
          transform: 'rotate(-30deg)',
          padding: '2rem 1.5rem',
        }}
      >
        {text}
      </span>
    ));
    return cells;
  }, [watermarkText]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div ref={containerRef} className="screenshot-protected relative">
      {/* Protected content */}
      <div
        className="transition-all duration-300"
        style={{
          filter: isHidden ? 'blur(20px)' : 'none',
          opacity: isHidden ? 0.3 : 1,
        }}
      >
        {children}
      </div>

      {/* Invisible watermark overlay */}
      {showWatermark && (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden select-none"
          style={{
            opacity: 0.03,
            mixBlendMode: 'multiply',
            zIndex: 10,
          }}
          aria-hidden="true"
        >
          <div className="flex flex-wrap items-center justify-center w-full h-full text-foreground">
            {watermarkPattern}
          </div>
        </div>
      )}

      {/* Content hidden overlay */}
      {isHidden && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/95 rounded-lg">
          <Shield className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-lg font-semibold text-foreground">Content Protected</p>
          <p className="text-sm text-muted-foreground mt-1">
            Return to this tab to view content
          </p>
          {interceptCount > 0 && (
            <p className="text-xs text-muted-foreground mt-3">
              {interceptCount} capture attempt{interceptCount !== 1 ? 's' : ''} intercepted
            </p>
          )}
        </div>
      )}
    </div>
  );
};
