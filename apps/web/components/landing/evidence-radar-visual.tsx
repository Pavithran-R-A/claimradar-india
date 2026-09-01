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
    cx: 405,
    cy: 145,
    labelX: 415,
    labelY: 140,
    textAnchor: 'start',
    description: 'Disgorgement accounts, recovery proceedings, and investor compensation funds.',
    monitoringType: 'Official Orders & Public Notices',
    delaySec: 3.5,
  },
  {
    code: 'RBI',
    name: 'Reserve Bank of India',
    domain: 'Depositor Education & Awareness',
    cx: 115,
    cy: 145,
    labelX: 105,
    labelY: 140,
    textAnchor: 'end',
    description: 'Unclaimed deposits, banking ombudsman schemes, and depositor relief circulars.',
    monitoringType: 'Official Circulars & Press Releases',
    delaySec: 7.0,
  },
  {
    code: 'IBBI',
    name: 'Insolvency & Bankruptcy Board of India',
    domain: 'Corporate Insolvency Claims',
    cx: 135,
    cy: 385,
    labelX: 125,
    labelY: 400,
    textAnchor: 'end',
    description:
      'Corporate insolvency claim windows, creditor forms B/C/D, and liquidation notices.',
    monitoringType: 'Public Announcements & Gazette Feeds',
    delaySec: 10.5,
  },
  {
    code: 'TRAI',
    name: 'Telecom Regulatory Authority of India',
    domain: 'Consumer Tariffs & Refunds',
    cx: 385,
    cy: 385,
    labelX: 395,
    labelY: 400,
    textAnchor: 'start',
    description:
      'Consumer compensation directives, telecom provider penalty distributions, and refunds.',
    monitoringType: 'Regulatory Directives & Gazettes',
    delaySec: 12.0,
  },
  {
    code: 'PIB',
    name: 'Press Information Bureau',
    domain: 'Union Ministry Notices',
    cx: 260,
    cy: 65,
    labelX: 260,
    labelY: 48,
    textAnchor: 'middle',
    description:
      'Official union ministry compensation announcements, tribunal settlements, and gazettes.',
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
      className={cn(
        'relative flex flex-col items-center justify-center p-2 sm:p-4 select-none',
        className,
      )}
      aria-label="Monitored official sources diagram"
    >
      {/* Editorial Scientific Instrument Outer Frame */}
      <div className="relative w-full max-w-[440px] aspect-square rounded-md border border-border bg-surface p-4 shadow-xs hover:border-border/90 transition-colors duration-180">
        {/* Instrument Header with Mandatory Truth Integrity Microcopy */}
        <div className="flex items-center justify-between border-b border-border pb-2.5 mb-2.5 text-xs text-text-muted">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-trust-primary" />
            <span className="font-bold text-text-primary">SOURCE VERIFICATION</span>
          </div>
          <span className="text-text-secondary text-xs">Monitored official sources</span>
        </div>

        {/* SVG Radar Visual Canvas (Editorial Slate & Blue) */}
        <svg
          viewBox="0 0 520 520"
          className="w-full h-full overflow-visible"
          role="img"
          aria-label="Radar diagram monitoring SEBI, RBI, IBBI, TRAI, and PIB"
        >
          <defs>
            {/* Rotating conic sweep trail gradient in deep editorial blue */}
            <radialGradient id="editorialSweepGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#214E80" stopOpacity="0.14" />
              <stop offset="70%" stopColor="#214E80" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#214E80" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Coordinate Range Grid Rings */}
          <circle cx="260" cy="260" r="230" stroke="#D9DAD6" strokeWidth="1" />
          <circle
            cx="260"
            cy="260"
            r="230"
            stroke="#214E80"
            strokeWidth="1"
            strokeOpacity="0.25"
            strokeDasharray="3 6"
          />

          {/* Range Ring 3 */}
          <circle cx="260" cy="260" r="175" stroke="#D9DAD6" strokeWidth="1" />
          <circle
            cx="260"
            cy="260"
            r="175"
            stroke="#214E80"
            strokeWidth="1"
            strokeOpacity="0.25"
            strokeDasharray="2 4"
          />

          {/* Range Ring 2 */}
          <circle cx="260" cy="260" r="115" stroke="#D9DAD6" strokeWidth="1" />
          <circle
            cx="260"
            cy="260"
            r="115"
            stroke="#214E80"
            strokeWidth="1"
            strokeOpacity="0.3"
            strokeDasharray="2 3"
          />

          {/* Range Ring 1 */}
          <circle
            cx="260"
            cy="260"
            r="55"
            stroke="#214E80"
            strokeWidth="1"
            strokeOpacity="0.35"
            strokeDasharray="2 2"
          />

          {/* Crosshair Axes */}
          <line
            x1="260"
            y1="20"
            x2="260"
            y2="500"
            stroke="#D9DAD6"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line
            x1="20"
            y1="260"
            x2="500"
            y2="260"
            stroke="#D9DAD6"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Radar Sweep Rotating Beam (14s slow sweep) */}
          <g className="origin-[260px_260px] animate-radar-sweep pointer-events-none motion-reduce:!animate-none">
            {/* Pie Wedge Beam */}
            <path
              d="M260 260 L490 260 A230 230 0 0 0 422 98 Z"
              fill="url(#editorialSweepGradient)"
            />
            {/* Leading Edge Line */}
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

          {/* Monitored Authority Nodes */}
          {MONITORED_NODES.map((node) => {
            const isSelected = selectedNode?.code === node.code;
            return (
              <g
                key={node.code}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${node.code}: ${node.name}`}
                aria-expanded={isSelected}
                className="cursor-pointer transition-all duration-140 group focus-visible:outline-none"
                onClick={() => setSelectedNode(isSelected ? null : node)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedNode(isSelected ? null : node);
                  }
                }}
              >
                {/* Visible Keyboard Focus Indicator */}
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r={isSelected ? 16 : 14}
                  stroke="#214E80"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                  className="opacity-0 group-focus-visible:opacity-100 group-focus:opacity-100 transition-opacity duration-140"
                />

                {/* Subtle staggered detection pulse */}
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r="12"
                  stroke="#214E80"
                  strokeWidth="1"
                  className="origin-[var(--cx)_var(--cy)] animate-detection-blip pointer-events-none motion-reduce:!animate-none"
                  style={
                    {
                      '--cx': `${node.cx}px`,
                      '--cy': `${node.cy}px`,
                      animationDelay: `${node.delaySec}s`,
                    } as React.CSSProperties
                  }
                />

                {/* Node Solid Center */}
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r={isSelected ? 5.5 : 4}
                  fill={isSelected ? '#15171A' : '#214E80'}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  className="transition-transform duration-140 group-hover:scale-125"
                />

                {/* Authority Code Text Tag */}
                <text
                  x={node.labelX}
                  y={node.labelY}
                  textAnchor={node.textAnchor}
                  fill={isSelected ? '#15171A' : '#214E80'}
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                  className="transition-colors duration-140 group-hover:fill-text-primary group-focus-visible:fill-text-primary"
                >
                  {node.code}
                </text>
              </g>
            );
          })}

          {/* Central Radar Receiver Core */}
          <circle cx="260" cy="260" r="14" fill="#FFFFFF" stroke="#214E80" strokeWidth="1.5" />
          <circle cx="260" cy="260" r="4" fill="#214E80" />
        </svg>

        {/* Footer Mandatory Plain Language Notice */}
        <div className="mt-2.5 flex flex-col gap-1 border-t border-border pt-2 text-xs text-text-muted">
          <p className="font-semibold text-text-primary">
            Every listing is checked against the source.
          </p>
          <p className="text-xs text-text-secondary leading-relaxed">
            This shows our verification process. It is not a live activity feed. ClaimRadar does not
            file claims or collect official filing fees. You act on the official portal.
          </p>
        </div>
      </div>

      {/* Accessible Detail Drawer / Dialog */}
      {selectedNode && (
        <div
          role="region"
          aria-live="polite"
          aria-modal="true"
          aria-labelledby="radar-node-title"
          style={{
            animation: 'scale-in 200ms cubic-bezier(0.16, 1, 0.3, 1) both',
          }}
          className="absolute inset-x-2 bottom-2 z-20 rounded-md border border-border bg-surface p-4 shadow-lg text-text-primary"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="rounded bg-surface-strong border border-border px-2 py-0.5 text-xs font-bold text-trust-primary">
                {selectedNode.code}
              </span>
              <h4 id="radar-node-title" className="text-sm font-bold text-text-primary">
                {selectedNode.name}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setSelectedNode(null)}
              className="rounded p-1 text-text-muted hover:text-text-primary hover:bg-surface-strong transition-colors duration-140"
              aria-label="Close authority inspector"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-xs text-text-secondary leading-relaxed">
            {selectedNode.description}
          </p>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-trust-primary" />
              {selectedNode.monitoringType}
            </span>
            <span className="text-trust-primary font-semibold">{selectedNode.domain}</span>
          </div>
        </div>
      )}
    </div>
  );
}
