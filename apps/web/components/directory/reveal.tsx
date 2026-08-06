'use client';

import * as React from 'react';
import { cn } from '@claimradar/design-system';

/**
 * Progressive-enhancement scroll reveal.
 *
 * Server HTML always renders fully visible (immediate-content fallback). Only
 * after mount — and only when the user has no reduced-motion preference — do
 * we hide the element and reveal it on intersection. Without JS or with
 * reduced motion the content is simply always there. No layout dimensions are
 * animated, so CLS stays 0.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof IntersectionObserver === 'undefined') return;

    el.classList.add('reveal-ready');
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.style.transitionDelay = `${delay}ms`;
            el.classList.remove('reveal-ready');
            el.classList.add('reveal-shown');
            observer.disconnect();
          }
        }
      },
      { rootMargin: '0px 0px -32px 0px', threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
