'use client';

import * as React from 'react';
import { Database, Cpu, CheckCircle2, Landmark } from 'lucide-react';

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
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAGES.map((stage) => {
          const Icon = stage.icon;
          return (
            <div
              key={stage.step}
              className="relative flex flex-col justify-between rounded-md border border-border bg-surface p-5 transition-colors duration-140 hover:border-trust-primary/40"
            >
              <div>
                <div className="flex items-center justify-between border-b border-border/80 pb-3 mb-3">
                  <span className="font-mono text-xs font-bold text-trust-primary">
                    STAGE {stage.step}
                  </span>
                  <Icon className="h-4 w-4 text-text-muted" />
                </div>
                <h4 className="text-base font-bold text-text-primary tracking-tight">
                  {stage.title}
                </h4>
                <p className="mt-2 text-xs sm:text-sm text-text-secondary leading-relaxed">
                  {stage.description}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/60">
                <span className="text-[11px] font-mono text-text-muted block">{stage.detail}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
