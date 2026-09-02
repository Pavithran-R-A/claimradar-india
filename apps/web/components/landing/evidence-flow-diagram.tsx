'use client';

import * as React from 'react';
import { Database, FileText, CheckCircle2, Landmark } from 'lucide-react';
import { cn } from '@claimradar/design-system';

const STAGES = [
  {
    step: '01',
    title: 'We capture the original notice',
    icon: Database,
    description:
      'We monitor official orders, circulars, and public releases from SEBI, RBI, IBBI, TRAI, and PIB.',
    detail: 'Primary authority documents only',
  },
  {
    step: '02',
    title: 'We structure dates, eligibility, and relief',
    icon: FileText,
    description:
      'Key affected groups, compensation terms, required evidence, and statutory deadlines are organized clearly.',
    detail: 'Zero speculation, exact stated terms',
  },
  {
    step: '03',
    title: 'A human editor checks the source',
    icon: CheckCircle2,
    description:
      'Senior editors independently verify every listing against official source records before publication.',
    detail: 'Human verification gate',
  },
  {
    step: '04',
    title: 'You get the official place to act',
    icon: Landmark,
    description:
      'Direct links to authentic authority portals to submit claims without intermediaries or fees.',
    detail: 'Direct official access',
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
      {/* Vertical Editorial Timeline */}
      <div className="relative pl-7 sm:pl-8 space-y-6 sm:space-y-7">
        {/* Continuous Connecting Timeline Line */}
        <div className="absolute left-[13px] sm:left-[15px] top-3 bottom-3 w-[2px] bg-border pointer-events-none">
          {/* Progressive Draw Line in Deep Editorial Blue */}
          <div
            className={cn(
              'w-full bg-trust-primary transition-all duration-1000 ease-out origin-top',
              isInView ? 'h-full opacity-100' : 'h-0 opacity-0',
            )}
          />
        </div>

        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <div
              key={stage.step}
              style={{
                transitionDelay: isInView ? `${idx * 120}ms` : '0ms',
                transform: isInView ? 'none' : 'translateY(8px)',
                opacity: isInView ? 1 : 0,
              }}
              className="group relative flex items-start gap-4 transition-all duration-enter ease-out motion-reduce:!opacity-100 motion-reduce:!transform-none"
            >
              {/* Numbered Marker Anchor */}
              <div className="absolute -left-7 sm:-left-8 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border-2 border-surface bg-surface-strong text-trust-primary shadow-xs transition-colors duration-fast group-hover:border-trust-primary group-hover:bg-trust-primary group-hover:text-white">
                <span className="font-mono text-xs font-bold leading-none">{stage.step}</span>
              </div>

              {/* Content Block */}
              <div className="flex-1 pt-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-base sm:text-lg font-bold text-text-primary tracking-tight group-hover:text-trust-primary transition-colors duration-fast">
                    {stage.title}
                  </h4>
                  <Icon className="h-4 w-4 text-text-muted group-hover:text-trust-primary transition-colors duration-fast shrink-0" />
                </div>
                <p className="mt-1 text-sm sm:text-base leading-relaxed text-text-secondary">
                  {stage.description}
                </p>
                <span className="mt-1.5 inline-block text-xs font-medium text-text-muted">
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
