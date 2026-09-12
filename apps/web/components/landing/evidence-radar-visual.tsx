'use client';

import * as React from 'react';
import {
  BarChart3,
  Building2,
  FileText,
  Landmark,
  Radio,
  ShieldCheck,
  X,
  type LucideIcon,
} from 'lucide-react';
import { BrandMark, cn } from '@claimradar/design-system';

interface AuthorityNode {
  code: string;
  name: string;
  domain: string;
  cx: number;
  cy: number;
  labelX: number;
  labelY: number;
  textAnchor: 'start' | 'end' | 'middle';
  description: string;
  monitoringType: string;
  delaySec: number;
  accent: string;
  pale: string;
  icon: LucideIcon;
}

const MONITORED_NODES: AuthorityNode[] = [
  {
    code: 'SEBI',
    name: 'Securities and Exchange Board of India',
    domain: 'Investor Recovery & Refunds',
    cx: 390,
    cy: 155,
    labelX: 408,
    labelY: 151,
    textAnchor: 'start',
    description: 'Disgorgement accounts, recovery proceedings, and investor compensation funds.',
    monitoringType: 'Official Orders & Public Notices',
    delaySec: 3.5,
    accent: '#3B82F6',
    pale: '#EAF3FF',
    icon: BarChart3,
  },
  {
    code: 'RBI',
    name: 'Reserve Bank of India',
    domain: 'Unclaimed Deposits & Banking Relief',
    cx: 130,
    cy: 155,
    labelX: 112,
    labelY: 151,
    textAnchor: 'end',
    description: 'Unclaimed deposits, banking ombudsman schemes, and depositor relief circulars.',
    monitoringType: 'Official Circulars & Press Releases',
    delaySec: 1.1,
    accent: '#F5B940',
    pale: '#FFF7DD',
    icon: Landmark,
  },
  {
    code: 'IBBI',
    name: 'Insolvency & Bankruptcy Board of India',
    domain: 'Corporate Insolvency Claims',
    cx: 145,
    cy: 375,
    labelX: 128,
    labelY: 392,
    textAnchor: 'end',
    description: 'Corporate insolvency claim windows, creditor forms, and liquidation notices.',
    monitoringType: 'Public Announcements & Creditor Notices',
    delaySec: 4.2,
    accent: '#0F8B8D',
    pale: '#E6F7F5',
    icon: FileText,
  },
  {
    code: 'TRAI',
    name: 'Telecom Regulatory Authority of India',
    domain: 'Telecom Consumer Relief',
    cx: 375,
    cy: 375,
    labelX: 393,
    labelY: 392,
    textAnchor: 'start',
    description: 'Consumer compensation directives, tariff notices, and telecom refund guidance.',
    monitoringType: 'Regulatory Directives & Public Notices',
    delaySec: 5.1,
    accent: '#0F8B8D',
    pale: '#E6F7F5',
    icon: Radio,
  },
  {
    code: 'PIB',
    name: 'Press Information Bureau',
    domain: 'Union Ministry Notices',
    cx: 260,
    cy: 75,
    labelX: 260,
    labelY: 53,
    textAnchor: 'middle',
    description: 'Official union ministry compensation announcements and public releases.',
    monitoringType: 'Official Government Press Dispatches',
    delaySec: 0.5,
    accent: '#2563EB',
    pale: '#EAF1FF',
    icon: Building2,
  },
];

export function EvidenceRadarVisual({ className }: { className?: string }) {
  const [selectedNode, setSelectedNode] = React.useState<AuthorityNode | null>(
    MONITORED_NODES[1] ?? null,
  );

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && selectedNode) setSelectedNode(null);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode]);

  const SelectedIcon = selectedNode?.icon ?? FileText;

  return (
    <div
      className={cn('relative mx-auto w-full max-w-[620px] select-none', className)}
      aria-label="Monitored official sources diagram"
    >
      <div className="rounded-xl border border-[#d8e2e8] bg-white p-4 shadow-[0_18px_50px_rgba(13,33,72,0.06)] sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-3 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-trust-primary" />
            <span className="font-bold tracking-[0.08em] text-text-primary">OFFICIAL SOURCES WE CHECK</span>
          </div>
          <span className="hidden text-text-secondary sm:inline">5 monitored families</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_190px] sm:items-center">
          <div className="relative aspect-square min-w-0">
            <svg viewBox="0 0 520 520" className="h-full w-full" aria-hidden="true">
              <defs>
                <linearGradient id="claimkhojBeam" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#F5B940" stopOpacity="0" />
                  <stop offset="100%" stopColor="#F5B940" stopOpacity="0.42" />
                </linearGradient>
              </defs>

              <circle cx="260" cy="260" r="229" fill="#FBFDFF" stroke="#C8D7E2" strokeWidth="1" />
              {[55, 115, 175, 229].map((radius, index) => (
                <circle
                  key={radius}
                  cx="260"
                  cy="260"
                  r={radius}
                  fill="none"
                  stroke={index === 3 ? '#78A3C7' : '#C9D8E3'}
                  strokeWidth="1"
                  strokeDasharray={index === 3 ? '5 7' : '3 4'}
                  strokeOpacity={index === 3 ? 0.72 : 0.82}
                />
              ))}
              <line x1="260" y1="31" x2="260" y2="489" stroke="#D8E3EA" strokeDasharray="4 5" />
              <line x1="31" y1="260" x2="489" y2="260" stroke="#D8E3EA" strokeDasharray="4 5" />

              <g
                className="animate-radar-sweep motion-reduce:!animate-none"
                style={{ transformOrigin: '260px 260px' }}
              >
                <path d="M260 260 L489 260 A229 229 0 0 0 452 132 Z" fill="url(#claimkhojBeam)" />
                <line x1="260" y1="260" x2="489" y2="260" stroke="#D99417" strokeWidth="1.75" />
              </g>

              {MONITORED_NODES.map((node) => {
                const isSelected = selectedNode?.code === node.code;
                return (
                  <g key={node.code} className="pointer-events-none group/node">
                    <line
                      x1="260"
                      y1="260"
                      x2={node.cx}
                      y2={node.cy}
                      stroke={node.accent}
                      strokeOpacity={isSelected ? 0.42 : 0.16}
                      strokeWidth={isSelected ? 1.5 : 1}
                    />
                    <circle
                      cx={node.cx}
                      cy={node.cy}
                      r={isSelected ? 23 : 20}
                      fill={node.pale}
                      stroke={node.accent}
                      strokeWidth={isSelected ? 2 : 1.2}
                    />
                    <circle
                      cx={node.cx}
                      cy={node.cy}
                      r="26"
                      fill="none"
                      stroke={node.accent}
                      strokeWidth="1"
                      strokeDasharray="3 3"
                      className={cn(
                        'transition-opacity duration-fast group-focus-visible:opacity-100',
                        isSelected ? 'opacity-60' : 'opacity-20',
                      )}
                    />
                    <circle
                      cx={node.cx}
                      cy={node.cy}
                      r="25"
                      fill="none"
                      stroke={node.accent}
                      strokeWidth="1"
                      className="animate-detection-blip motion-reduce:!animate-none pointer-events-none"
                      style={{
                        animationDelay: `${node.delaySec}s`,
                        transformOrigin: `${node.cx}px ${node.cy}px`,
                      }}
                    />
                    <text
                      x={node.labelX}
                      y={node.labelY}
                      textAnchor={node.textAnchor}
                      className="select-none fill-trust-primary font-mono text-[11px] font-extrabold tracking-tight"
                    >
                      {node.code}
                    </text>
                  </g>
                );
              })}
            </svg>

            <nav aria-label="Monitored official sources" className="absolute inset-0">
              {MONITORED_NODES.map((node) => {
                const isSelected = selectedNode?.code === node.code;
                const Icon = node.icon;
                return (
                  <button
                    key={node.code}
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={`Inspect ${node.code}: ${node.name}`}
                    onClick={() => setSelectedNode(node)}
                    className="group/node absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-primary focus-visible:ring-offset-2"
                    style={{ left: `${(node.cx / 520) * 100}%`, top: `${(node.cy / 520) * 100}%` }}
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 items-center justify-center rounded-full transition-all duration-ui group-hover/node:-translate-y-0.5 group-hover/node:scale-105"
                      style={{ color: node.accent }}
                    >
                      <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                    </span>
                  </button>
                );
              })}
            </nav>

            <div className="pointer-events-none absolute left-1/2 top-1/2 flex h-[116px] w-[116px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-[#d7e2e9] bg-white/95 text-center shadow-[0_10px_26px_rgba(13,33,72,0.10)] backdrop-blur-sm">
              <BrandMark size={40} variant="light" />
              <span className="mt-1 font-display text-sm font-bold text-trust-primary">ClaimKhoj</span>
              <span className="mt-0.5 max-w-[88px] text-[0.47rem] font-bold uppercase tracking-[0.18em] text-text-muted">
                Find what you can claim
              </span>
            </div>
          </div>

          <div
            role="region"
            aria-live="polite"
            aria-label={selectedNode ? `${selectedNode.code} monitoring details` : 'Source spotlight'}
            className="relative min-h-[230px] rounded-xl border border-[#d7e4ea] bg-[#F8FCFD] p-4 shadow-[0_10px_28px_rgba(13,33,72,0.05)]"
          >
            {selectedNode ? (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.16em] text-trust-primary/70">
                      SOURCE SPOTLIGHT
                    </p>
                    <div
                      className="mt-3 flex h-11 w-11 items-center justify-center rounded-full"
                      style={{ backgroundColor: selectedNode.pale, color: selectedNode.accent }}
                    >
                      <SelectedIcon className="h-5 w-5" strokeWidth={2} />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedNode(null)}
                    className="rounded p-1 text-text-muted transition-colors duration-fast hover:bg-white hover:text-text-primary"
                    aria-label="Close authority inspector"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-3 font-mono text-xs font-extrabold tracking-wide" style={{ color: selectedNode.accent }}>
                  {selectedNode.code}
                </p>
                <h3 className="mt-1 font-display text-lg font-bold leading-tight text-trust-primary">
                  {selectedNode.domain}
                </h3>
                <p className="mt-2 text-xs leading-5 text-text-secondary">{selectedNode.description}</p>
                <div className="mt-4 border-t border-border pt-3 text-[0.68rem] leading-4 text-text-muted">
                  {selectedNode.monitoringType}
                </div>
              </>
            ) : (
              <div className="flex min-h-[198px] flex-col items-center justify-center text-center">
                <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.16em] text-trust-primary/70">
                  SOURCE SPOTLIGHT
                </p>
                <p className="mt-3 font-display text-lg font-bold text-trust-primary">Choose a source</p>
                <p className="mt-2 text-xs leading-5 text-text-secondary">
                  Select any authority node to see what ClaimKhoj monitors there.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 border-t border-border pt-3 text-xs text-text-muted">
          <div className="flex flex-wrap items-center justify-between gap-2 font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-trust-primary" />
              <span className="text-text-primary">Every listing is checked against the source.</span>
            </div>
            <span className="text-text-secondary">{MONITORED_NODES.length} Sources</span>
          </div>
          <p className="mt-1.5 leading-relaxed">
            Select a source to inspect its monitoring scope. This is not a live activity feed.
            ClaimKhoj does not file claims or collect official filing fees. You act on the official portal.
          </p>
        </div>
      </div>
    </div>
  );
}
