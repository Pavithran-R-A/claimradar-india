'use client';

import * as React from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { cn } from '@claimradar/design-system';

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
}

const MONITORED_NODES: AuthorityNode[] = [
  {
    code: 'SEBI',
    name: 'Securities and Exchange Board of India',
    domain: 'Investor Recovery & Refunds',
    cx: 390,
    cy: 155,
    labelX: 405,
    labelY: 150,
    textAnchor: 'start',
    description: 'Disgorgement accounts, recovery proceedings, and investor compensation funds.',
    monitoringType: 'Official Orders & Public Notices',
    delaySec: 3.5,
  },
  {
    code: 'RBI',
    name: 'Reserve Bank of India',
    domain: 'Depositor Education & Awareness',
    cx: 130,
    cy: 155,
    labelX: 115,
    labelY: 150,
    textAnchor: 'end',
    description: 'Unclaimed deposits, banking ombudsman schemes, and depositor relief circulars.',
    monitoringType: 'Official Circulars & Press Releases',
    delaySec: 7.0,
  },
  {
    code: 'IBBI',
    name: 'Insolvency & Bankruptcy Board of India',
    domain: 'Corporate Insolvency Claims',
    cx: 145,
    cy: 375,
    labelX: 130,
    labelY: 390,
    textAnchor: 'end',
    description:
      'Corporate insolvency claim windows, creditor forms B/C/D, and liquidation notices.',
    monitoringType: 'Public Announcements & Creditor Notices',
    delaySec: 10.5,
  },
  {
    code: 'TRAI',
    name: 'Telecom Regulatory Authority of India',
    domain: 'Consumer Tariffs & Refunds',
    cx: 375,
    cy: 375,
    labelX: 390,
    labelY: 390,
    textAnchor: 'start',
    description:
      'Consumer compensation directives, telecom provider penalty distributions, and refunds.',
    monitoringType: 'Regulatory Directives & Public Notices',
    delaySec: 12.0,
  },
  {
    code: 'PIB',
    name: 'Press Information Bureau',
    domain: 'Union Ministry Notices',
    cx: 260,
    cy: 75,
    labelX: 260,
    labelY: 58,
    textAnchor: 'middle',
    description: 'Official union ministry compensation announcements and public releases.',
    monitoringType: 'Official Government Press Dispatches',
    delaySec: 0.5,
  },
];

export function EvidenceRadarVisual({ className }: { className?: string }) {
  const [selectedNode, setSelectedNode] = React.useState<AuthorityNode | null>(null);

  // Close drawer on Escape key
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && selectedNode) {
        setSelectedNode(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode]);

  return (
    <div
      className={cn('relative w-full max-w-[400px] mx-auto select-none', className)}
      aria-label="Monitored official sources diagram"
    >
      {/* Editorial Scientific Instrument Outer Frame (Natural sizing, NOT aspect-square) */}
      <div className="relative w-full rounded-md border border-border bg-surface p-4 sm:p-5 shadow-xs hover:border-border/90 transition-colors duration-ui">
        {/* Instrument Header with Mandatory Truth Integrity Microcopy */}
        <div className="flex items-center justify-between border-b border-border pb-2.5 mb-3 text-xs text-text-muted">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-trust-primary" />
            <span className="font-bold text-text-primary tracking-wide">SOURCE VERIFICATION</span>
          </div>
          <span className="text-text-secondary text-xs">Monitored official sources</span>
        </div>

        {/* Dedicated Square Radar Canvas Container */}
        <div className="relative aspect-square w-full">
          <svg viewBox="0 0 520 520" className="w-full h-full" aria-hidden="true">
            <defs>
              {/* Rotating conic sweep trail gradient in deep editorial blue */}
              <radialGradient id="editorialSweepGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#214E80" stopOpacity="0.12" />
                <stop offset="70%" stopColor="#214E80" stopOpacity="0.03" />
                <stop offset="100%" stopColor="#214E80" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Subtle Canvas Background Circle */}
            <circle
              cx="260"
              cy="260"
              r="230"
              fill="rgba(33, 78, 128, 0.015)"
              stroke="#D9DAD6"
              strokeWidth="1"
            />

            {/* Coordinate Range Grid Rings — ALL EXPLICITLY fill="none" */}
            <circle
              cx="260"
              cy="260"
              r="230"
              fill="none"
              stroke="#214E80"
              strokeWidth="1"
              strokeOpacity="0.2"
              strokeDasharray="3 6"
            />

            {/* Range Ring 3 */}
            <circle cx="260" cy="260" r="175" fill="none" stroke="#D9DAD6" strokeWidth="1" />
            <circle
              cx="260"
              cy="260"
              r="175"
              fill="none"
              stroke="#214E80"
              strokeWidth="1"
              strokeOpacity="0.2"
              strokeDasharray="2 4"
            />

            {/* Range Ring 2 */}
            <circle cx="260" cy="260" r="115" fill="none" stroke="#D9DAD6" strokeWidth="1" />
            <circle
              cx="260"
              cy="260"
              r="115"
              fill="none"
              stroke="#214E80"
              strokeWidth="1"
              strokeOpacity="0.25"
              strokeDasharray="2 3"
            />

            {/* Range Ring 1 */}
            <circle
              cx="260"
              cy="260"
              r="55"
              fill="none"
              stroke="#214E80"
              strokeWidth="1"
              strokeOpacity="0.3"
              strokeDasharray="2 2"
            />

            {/* Crosshair Axes */}
            <line
              x1="260"
              y1="30"
              x2="260"
              y2="490"
              stroke="#D9DAD6"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <line
              x1="30"
              y1="260"
              x2="490"
              y2="260"
              stroke="#D9DAD6"
              strokeWidth="1"
              strokeDasharray="4 4"
            />

            {/* Continuous six-second evidence route sweep. */}
            <g
              className="animate-radar-sweep motion-reduce:!animate-none"
              style={{ transformOrigin: '260px 260px' }}
            >
              {/* Subtle Conic Sector Trail */}
              <path
                d="M260 260 L490 260 A230 230 0 0 0 422 98 Z"
                fill="url(#editorialSweepGradient)"
              />
              {/* Leading Hairline Scan Vector */}
              <line
                x1="260"
                y1="260"
                x2="490"
                y2="260"
                stroke="#214E80"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </g>

            {/* Central Precision Receiver Core */}
            <circle cx="260" cy="260" r="10" fill="#FFFFFF" stroke="#214E80" strokeWidth="1.5" />
            <circle cx="260" cy="260" r="3.5" fill="#214E80" />

            {/* Monitored Authority Nodes */}
            {MONITORED_NODES.map((node) => {
              const isSelected = selectedNode?.code === node.code;
              return (
                <g
                  key={node.code}
                  className="pointer-events-none group/node"
                  onClick={() => setSelectedNode(node)}
                >
                  {/* Outer Focus / Selection Indicator — fill="none" */}
                  <circle
                    cx={node.cx}
                    cy={node.cy}
                    r={isSelected ? 16 : 14}
                    fill="none"
                    stroke="#214E80"
                    strokeWidth={isSelected ? 2 : 1}
                    strokeDasharray="3 3"
                    className={cn(
                      'transition-all duration-fast group-focus-visible:opacity-100',
                      isSelected
                        ? 'opacity-100 scale-105'
                        : 'opacity-40 group-hover/node:opacity-80',
                    )}
                  />

                  {/* Periodic Radar Blip Animation (Transforms only) — fill="none" */}
                  <circle
                    cx={node.cx}
                    cy={node.cy}
                    r="12"
                    fill="none"
                    stroke="#214E80"
                    strokeWidth="1"
                    className="animate-detection-blip motion-reduce:!animate-none pointer-events-none"
                    style={{
                      animationDelay: `${node.delaySec}s`,
                      transformOrigin: `${node.cx}px ${node.cy}px`,
                    }}
                  />

                  {/* Solid Interactive Core */}
                  <circle
                    cx={node.cx}
                    cy={node.cy}
                    r={isSelected ? 6 : 4.5}
                    fill={isSelected ? '#214E80' : '#15171A'}
                    className="transition-all duration-fast group-hover/node:fill-trust-primary"
                  />

                  {/* Restrained Typography Label */}
                  <text
                    x={node.labelX}
                    y={node.labelY}
                    textAnchor={node.textAnchor}
                    className={cn(
                      'font-mono text-xs font-bold tracking-tight transition-all duration-fast select-none pointer-events-none',
                      isSelected
                        ? 'fill-trust-primary font-extrabold'
                        : 'fill-text-primary group-hover/node:fill-trust-primary',
                    )}
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
              return (
                <button
                  key={node.code}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={`Inspect ${node.code}: ${node.name}`}
                  onClick={() => setSelectedNode(node)}
                  className="group/node absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-primary focus-visible:ring-offset-2"
                  style={{ left: `${(node.cx / 520) * 100}%`, top: `${(node.cy / 520) * 100}%` }}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full border border-trust-primary/50 bg-surface/60 transition-all duration-fast group-hover/node:border-trust-primary group-hover/node:bg-trust-primary/10 group-focus-visible:opacity-100',
                      isSelected && 'border-trust-primary bg-trust-primary/15 shadow-sm',
                    )}
                  >
                    <span
                      className={cn(
                        'h-2.5 w-2.5 rounded-full bg-text-primary transition-all duration-fast group-hover/node:bg-trust-primary',
                        isSelected && 'h-3.5 w-3.5 bg-trust-primary',
                      )}
                    />
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Accessible In-Place Inspector Drawer */}
          {selectedNode && (
            <div
              role="region"
              aria-live="polite"
              aria-label={`${selectedNode.code} monitoring details`}
              className="drawer-panel-enter absolute inset-x-2 bottom-2 rounded-md border border-border bg-surface/98 p-3.5 shadow-md backdrop-blur-sm z-20"
            >
              <div className="flex items-start justify-between gap-2 border-b border-border/80 pb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-trust-primary">
                      {selectedNode.code}
                    </span>
                    <span className="text-xs text-text-muted">·</span>
                    <span className="text-xs font-semibold text-text-primary">
                      {selectedNode.domain}
                    </span>
                  </div>
                  <h4 className="text-xs font-medium text-text-secondary mt-0.5">
                    {selectedNode.name}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedNode(null)}
                  className="rounded p-1 text-text-muted hover:bg-surface-strong hover:text-text-primary transition-colors duration-fast"
                  aria-label="Close authority inspector"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-2 text-xs text-text-secondary leading-relaxed space-y-1">
                <p>{selectedNode.description}</p>
                <div className="flex items-center justify-between text-xs text-text-muted pt-1.5 border-t border-border/60">
                  <span>{selectedNode.monitoringType}</span>
                  <span className="text-trust-primary font-medium">INDEXED</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Mandatory Truth Integrity Microcopy */}
        <div className="mt-3 pt-2.5 border-t border-border space-y-1.5 text-xs text-text-muted">
          <div className="flex items-center justify-between font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-trust-primary shrink-0" />
              <span className="text-text-primary">
                Every listing is checked against the source.
              </span>
            </div>
            <span className="text-text-secondary">{MONITORED_NODES.length} Sources</span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Select a source to inspect its monitoring scope. This is not a live activity feed.
            ClaimKhoj does not file claims or collect official filing fees. You act on the official
            portal.
          </p>
        </div>
      </div>
    </div>
  );
}
