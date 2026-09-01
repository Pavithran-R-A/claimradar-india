'use client';

import * as React from 'react';
import { Database, Cpu, CheckCircle2, Landmark } from 'lucide-react';
import { cn } from '@claimradar/design-system';

const STAGES = [
  {
    step: '01',
    title: 'Statutory Ingestion',
    icon: Database,
    description:
      'Raw orders, circulars, and gazettes ingested from SEBI, RBI, IBBI, TRAI, and PIB feeds.',
    detail: 'Cryptographic SHA-256 deduplication & timestamping',
  },
  {
    step: '02',
    title: 'Deterministic Extraction',
    icon: Cpu,
    description:
      'Statutory entities, relief clauses, submission deadlines, and claim forms parsed precisely.',
    detail: 'Zero hallucinated numbers or speculative relief',
  },
  {
    step: '03',
    title: 'Editorial Verification',
    icon: CheckCircle2,
    description:
      'Senior editors independently verify source document links and official filing instructions.',
    detail: 'Mandatory human approval before publication',
  },
  {
    step: '04',
    title: 'Direct Portal Route',
    icon: Landmark,
    description:
      'Citizens are guided directly to authentic official portals to submit their claims for free.',
    detail: 'Zero middleman fees, zero claim brokerage',
  },
];

export function EvidenceFlowDiagram() {
  const [isInView, setIsInView] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Connecting Track Rail SVG (Desktop Horizontal) */}
      <div className="hidden lg:block absolute top-[44px] left-[5%] right-[5%] h-[2px] pointer-events-none z-0">
        <svg className="w-full h-[2px] overflow-visible" preserveAspectRatio="none">
          <line
            x1="0"
            y1="1"
            x2="100%"
            y2="1"
            stroke="#D9DAD6"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <line
            x1="0"
            y1="1"
            x2="100%"
            y2="1"
            stroke="#214E80"
            strokeWidth="2"
            className={cn(
              'transition-all duration-1000 ease-out',
              isInView ? 'opacity-100 animate-draw-line' : 'opacity-0',
            )}
          />
        </svg>
      </div>

      {/* Grid of 4 Stages */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <div
              key={stage.step}
              style={{
                transitionDelay: isInView ? `${idx * 160}ms` : '0ms',
                transform: isInView ? 'none' : 'translateY(12px)',
                opacity: isInView ? 1 : 0,
              }}
              className={cn(
                'group relative flex flex-col justify-between rounded-md border border-border bg-surface p-5 sm:p-6 shadow-xs transition-all duration-enter ease-out hover:border-trust-primary hover:shadow-sm hover:-translate-y-[1px] motion-reduce:!opacity-100 motion-reduce:!transform-none',
              )}
            >
              <div>
                {/* Stage Number & Icon Header */}
                <div className="flex items-center justify-between border-b border-border/80 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-surface-strong border border-border text-xs font-mono font-bold text-trust-primary group-hover:bg-trust-primary group-hover:text-white transition-colors duration-fast">
                      {stage.step}
                    </span>
                    <span className="font-mono text-xs font-bold text-text-muted group-hover:text-trust-primary transition-colors duration-fast">
                      STAGE {stage.step}
                    </span>
                  </div>
                  <Icon className="h-4 w-4 text-text-muted group-hover:text-trust-primary group-hover:scale-110 transition-all duration-fast" />
                </div>

                <h4 className="text-base font-bold text-text-primary tracking-tight group-hover:text-trust-primary transition-colors duration-fast">
                  {stage.title}
                </h4>
                <p className="mt-2 text-xs sm:text-sm text-text-secondary leading-relaxed">
                  {stage.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60">
                <span className="text-xs font-mono text-text-muted group-hover:text-text-secondary transition-colors duration-fast block">
                  {stage.detail}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
