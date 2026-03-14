import { useEffect, useCallback, useState } from 'react';

export interface ScreenshotProtectionConfig {
  blockRightClick: boolean;
  blockKeyboardShortcuts: boolean;
  blurOnLeave: boolean;
  blockPrint: boolean;
  disableSelection: boolean;
  disableDrag: boolean;
}

const DEFAULT_CONFIG: ScreenshotProtectionConfig = {
  blockRightClick: true,
  blockKeyboardShortcuts: true,
  blurOnLeave: true,
  blockPrint: true,
  disableSelection: true,
  disableDrag: true,
};

export const useScreenshotProtection = (
  containerRef: React.RefObject<HTMLElement | null>,
  config: Partial<ScreenshotProtectionConfig> = {},
  enabled: boolean = true
) => {
  const settings = { ...DEFAULT_CONFIG, ...config };
  const [isHidden, setIsHidden] = useState(false);
  const [interceptCount, setInterceptCount] = useState(0);

  const incrementIntercept = useCallback(() => {
    setInterceptCount(prev => prev + 1);
  }, []);

  // Right-click blocking
  useEffect(() => {
    if (!enabled || !settings.blockRightClick) return;
    const el = containerRef.current;
    if (!el) return;

    const handler = (e: MouseEvent) => {
      e.preventDefault();
      incrementIntercept();
    };
    el.addEventListener('contextmenu', handler);
    return () => el.removeEventListener('contextmenu', handler);
  }, [enabled, settings.blockRightClick, containerRef, incrementIntercept]);

  // Keyboard shortcut blocking
  useEffect(() => {
    if (!enabled || !settings.blockKeyboardShortcuts) return;

    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      
      // Block Ctrl+S, Ctrl+C, Ctrl+P, Ctrl+Shift+S
      if (ctrl && ['s', 'c', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        incrementIntercept();
        return;
      }
      
      // Block PrintScreen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        incrementIntercept();
        return;
      }

      // Block Cmd+Shift+3/4 (macOS screenshot)
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        incrementIntercept();
        return;
      }
    };

    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, [enabled, settings.blockKeyboardShortcuts, incrementIntercept]);

  // Visibility change detection — blur on leave
  useEffect(() => {
    if (!enabled || !settings.blurOnLeave) return;

    const handleVisibility = () => {
      if (document.hidden || !document.hasFocus()) {
        setIsHidden(true);
        incrementIntercept();
      } else {
        setIsHidden(false);
      }
    };

    const handleBlur = () => {
      setIsHidden(true);
      incrementIntercept();
    };

    const handleFocus = () => {
      setIsHidden(false);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [enabled, settings.blurOnLeave, incrementIntercept]);

  // Print blocking
  useEffect(() => {
    if (!enabled || !settings.blockPrint) return;

    const styleEl = document.createElement('style');
    styleEl.textContent = `
      @media print {
        .screenshot-protected {
          display: none !important;
        }
        body::after {
          content: 'Content Protected — Printing Disabled';
          display: flex;
          align-items: center;
          justify-content: center;
          position: fixed;
          inset: 0;
          font-size: 2rem;
          color: #666;
        }
      }
    `;
    document.head.appendChild(styleEl);

    const handleBeforePrint = () => {
      setIsHidden(true);
      incrementIntercept();
    };
    const handleAfterPrint = () => {
      setIsHidden(false);
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      document.head.removeChild(styleEl);
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [enabled, settings.blockPrint, incrementIntercept]);

  // Selection and drag prevention
  useEffect(() => {
    if (!enabled) return;
    const el = containerRef.current;
    if (!el) return;

    if (settings.disableSelection) {
      el.style.userSelect = 'none';
      (el.style as any).webkitUserSelect = 'none';
    }
    if (settings.disableDrag) {
      (el.style as any).webkitUserDrag = 'none';
      const imgs = el.querySelectorAll('img');
      imgs.forEach(img => {
        img.draggable = false;
        (img.style as any).webkitUserDrag = 'none';
      });
    }

    return () => {
      el.style.userSelect = '';
      (el.style as any).webkitUserSelect = '';
      (el.style as any).webkitUserDrag = '';
    };
  }, [enabled, settings.disableSelection, settings.disableDrag, containerRef]);

  return { isHidden, interceptCount };
};
