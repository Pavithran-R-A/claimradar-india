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
        'relative flex flex-col items-center justify-center p-3 sm:p-5 select-none',
        className,
      )}
      aria-label="Monitored official sources diagram"
    >
      {/* Precision Instrument Outer Frame */}
      <div className="relative w-full max-w-[420px] aspect-square rounded-md border border-white/10 bg-ink-950/80 p-3.5 shadow-2xl backdrop-blur-md">
        {/* Instrument Header with Mandatory Truth Integrity Microcopy */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5 mb-2.5 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-bright" />
            <span className="tracking-wider uppercase text-slate-300 font-semibold">
              SOURCE VERIFICATION
            </span>
          </div>
          <span className="text-slate-400 font-sans text-xs">Monitored official sources</span>
        </div>

        {/* SVG Radar Visual Canvas */}
        <svg
          viewBox="0 0 520 520"
          className="w-full h-full overflow-visible"
          role="img"
          aria-label="Radar diagram monitoring SEBI, RBI, IBBI, TRAI, and PIB"
        >
          <defs>
            {/* Subtle rotating conic sweep trail gradient */}
            <radialGradient id="sweepGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.18" />
              <stop offset="70%" stopColor="#2DD4BF" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Coordinate Range Grid Rings */}
          <circle cx="260" cy="260" r="230" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
          <circle
            cx="260"
            cy="260"
            r="230"
            stroke="rgba(45, 212, 191, 0.2)"
            strokeWidth="1"
            strokeDasharray="3 6"
          />

          {/* Range Ring 3 */}
          <circle cx="260" cy="260" r="175" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" />
          <circle
            cx="260"
            cy="260"
            r="175"
            stroke="rgba(45, 212, 191, 0.2)"
            strokeWidth="1"
            strokeDasharray="2 4"
          />

          {/* Range Ring 2 */}
          <circle cx="260" cy="260" r="115" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
          <circle
            cx="260"
            cy="260"
            r="115"
            stroke="rgba(45, 212, 191, 0.25)"
            strokeWidth="1"
            strokeDasharray="2 3"
          />

          {/* Range Ring 1 */}
          <circle
            cx="260"
            cy="260"
            r="55"
            stroke="rgba(45, 212, 191, 0.3)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* Crosshair Axes */}
          <line
            x1="260"
            y1="20"
            x2="260"
            y2="500"
            stroke="rgba(255, 255, 255, 0.07)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line
            x1="20"
            y1="260"
            x2="500"
            y2="260"
            stroke="rgba(255, 255, 255, 0.07)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Radar Sweep Rotating Beam (14s slow sweep) */}
          <g className="origin-[260px_260px] animate-radar-sweep pointer-events-none">
            {/* Pie Wedge Beam */}
            <path d="M260 260 L490 260 A230 230 0 0 0 422 98 Z" fill="url(#sweepGradient)" />
            {/* Leading Edge Line */}
            <line
              x1="260"
              y1="260"
              x2="490"
              y2="260"
              stroke="#2DD4BF"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Leading Edge Glow */}
            <line
              x1="260"
              y1="260"
              x2="490"
              y2="260"
              stroke="#5EEAD4"
              strokeWidth="3"
              strokeOpacity="0.25"
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
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                  className="opacity-0 group-focus-visible:opacity-100 group-focus:opacity-100 transition-opacity"
                />

                {/* Rare, subtle staggered detection pulse */}
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r="12"
                  stroke="#2DD4BF"
                  strokeWidth="1"
                  className="origin-[var(--cx)_var(--cy)] animate-detection-blip pointer-events-none"
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
                  fill={isSelected ? '#FFFFFF' : '#2DD4BF'}
                  stroke="#0A1322"
                  strokeWidth="1.5"
                />

                {/* Authority Code Text Tag */}
                <text
                  x={node.labelX}
                  y={node.labelY}
                  textAnchor={node.textAnchor}
                  fill={isSelected ? '#FFFFFF' : '#2DD4BF'}
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="monospace"
                  letterSpacing="0.5"
                  className="transition-colors group-hover:fill-white group-focus-visible:fill-white"
                >
                  {node.code}
                </text>
              </g>
            );
          })}

          {/* Central Radar Receiver Core */}
          <circle cx="260" cy="260" r="16" fill="#060B14" stroke="#2DD4BF" strokeWidth="1.5" />
          <circle cx="260" cy="260" r="5" fill="#2DD4BF" />
        </svg>

        {/* Footer Mandatory Plain Language Notice */}
        <div className="mt-2.5 flex flex-col gap-1 border-t border-white/[0.08] pt-2 text-xs text-slate-400">
          <p className="font-medium text-slate-300">Every listing is checked against the source.</p>
          <p className="text-xs text-slate-500">
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
          className="absolute inset-x-2 bottom-2 z-20 rounded-md border border-brand-bright/40 bg-ink-900/95 p-4 shadow-2xl backdrop-blur-md text-white animate-in fade-in zoom-in-95 duration-140"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="rounded bg-brand-bright/20 border border-brand-bright/40 px-2 py-0.5 font-mono text-xs font-bold text-brand-bright">
                {selectedNode.code}
              </span>
              <h4 id="radar-node-title" className="text-sm font-bold text-white">
                {selectedNode.name}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setSelectedNode(null)}
              className="rounded p-1 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close authority inspector"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-300 leading-relaxed">{selectedNode.description}</p>
          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-bright" />
              {selectedNode.monitoringType}
            </span>
            <span className="text-brand-bright font-semibold">{selectedNode.domain}</span>
          </div>
        </div>
      )}
    </div>
  );
}
