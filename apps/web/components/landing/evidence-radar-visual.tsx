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
    description: 'Investor compensation, recovery proceedings and disgorgement funds.',
    monitoringType: 'Official Orders & Public Notices',
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
    description: 'Unclaimed deposits, banking ombudsman schemes and depositor relief circulars.',
    monitoringType: 'Official Circulars & Press Releases',
  },
  {
    code: 'IBBI',
    name: 'Insolvency & Bankruptcy Board of India',
    domain: 'Public Liquidation Claims',
    cx: 135,
    cy: 385,
    labelX: 125,
    labelY: 400,
    textAnchor: 'end',
    description: 'Corporate insolvency claims windows, forms B/C/D and liquidation notices.',
    monitoringType: 'Public Announcements & Gazette Feeds',
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
      'Consumer compensation directives, telecom provider penalty distributions and refunds.',
    monitoringType: 'Regulatory Directives & Gazettes',
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
      'Official union ministry compensation announcements, tribunal settlements and gazettes.',
    monitoringType: 'Official Government Press Dispatches',
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
        'relative mx-auto flex w-full max-w-[500px] flex-col items-center select-none',
        className,
      )}
      aria-label="ClaimRadar Monitored Source Evidence Radar"
    >
      {/* Visual Header / Model Badge */}
      <div className="mb-3 flex w-full items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-brand-bright animate-ping" />
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-bright">
            SOURCE VERIFICATION
          </span>
        </div>
        <span className="text-xs font-medium text-slate-400">
          Every listing is checked against the source.
        </span>
      </div>

      {/* SVG Precision Radar Visual */}
      <div className="relative aspect-square w-full rounded-2xl border border-white/15 bg-gradient-to-b from-ink-900/95 to-ink-950/95 p-2 sm:p-3 shadow-2xl backdrop-blur-sm overflow-hidden">
        {/* Subtle coordinate grid watermark */}
        <div className="absolute inset-0 bg-[radial-gradient(#2DD4BF_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <svg
          viewBox="0 0 520 520"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="sweepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.32" />
              <stop offset="60%" stopColor="#2DD4BF" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Range Ring 4 (Actionable Horizon) */}
          <circle cx="260" cy="260" r="230" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />
          <circle
            cx="260"
            cy="260"
            r="230"
            stroke="rgba(45, 212, 191, 0.25)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />

          {/* Range Ring 3 (Editorial Review) */}
          <circle cx="260" cy="260" r="175" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
          <circle
            cx="260"
            cy="260"
            r="175"
            stroke="rgba(45, 212, 191, 0.3)"
            strokeWidth="1"
            strokeDasharray="2 4"
          />

          {/* Range Ring 2 (Verify Horizon) */}
          <circle cx="260" cy="260" r="115" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />
          <circle
            cx="260"
            cy="260"
            r="115"
            stroke="rgba(45, 212, 191, 0.35)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* Range Ring 1 (Ingest Core) */}
          <circle
            cx="260"
            cy="260"
            r="55"
            stroke="rgba(45, 212, 191, 0.4)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* Crosshair Axes */}
          <line
            x1="260"
            y1="20"
            x2="260"
            y2="500"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line
            x1="20"
            y1="260"
            x2="500"
            y2="260"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Range Distance Markers */}
          <text
            x="264"
            y="95"
            fill="rgba(45, 212, 191, 0.6)"
            fontSize="10"
            fontFamily="monospace"
            letterSpacing="1"
          >
            ACTIONABLE
          </text>
          <text
            x="264"
            y="152"
            fill="rgba(45, 212, 191, 0.6)"
            fontSize="10"
            fontFamily="monospace"
            letterSpacing="1"
          >
            REVIEW
          </text>
          <text
            x="264"
            y="212"
            fill="rgba(45, 212, 191, 0.6)"
            fontSize="10"
            fontFamily="monospace"
            letterSpacing="1"
          >
            VERIFY
          </text>

          {/* Radar Sweep Rotating Beam */}
          <g className="origin-[260px_260px] animate-radar-sweep pointer-events-none">
            {/* Pie Wedge Beam (45-degree conic sweep trail) */}
            <path d="M260 260 L490 260 A230 230 0 0 0 422 98 Z" fill="url(#sweepGradient)" />
            {/* Leading Edge Line */}
            <line
              x1="260"
              y1="260"
              x2="490"
              y2="260"
              stroke="#2DD4BF"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Leading Edge Glow */}
            <line
              x1="260"
              y1="260"
              x2="490"
              y2="260"
              stroke="#5EEAD4"
              strokeWidth="4"
              strokeOpacity="0.3"
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
                className="cursor-pointer transition-all duration-200 group focus-visible:outline-none"
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
                  r={isSelected ? 18 : 16}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                  className="opacity-0 group-focus-visible:opacity-100 group-focus:opacity-100 transition-opacity"
                />

                {/* Outer Ping Ring */}
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r="14"
                  stroke="#2DD4BF"
                  strokeWidth="1.5"
                  className="origin-[var(--cx)_var(--cy)] animate-beacon-ping"
                  style={
                    {
                      '--cx': `${node.cx}px`,
                      '--cy': `${node.cy}px`,
                    } as React.CSSProperties
                  }
                />

                {/* Second Pulse Ring */}
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r="8"
                  stroke="#5EEAD4"
                  strokeWidth="1"
                  strokeOpacity="0.6"
                  className="origin-[var(--cx)_var(--cy)] animate-radar-pulse-ring"
                  style={
                    {
                      '--cx': `${node.cx}px`,
                      '--cy': `${node.cy}px`,
                    } as React.CSSProperties
                  }
                />

                {/* Node Solid Center */}
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r={isSelected ? 6 : 4.5}
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

          {/* Central Hub Core */}
          <circle cx="260" cy="260" r="16" fill="#0A1322" stroke="#2DD4BF" strokeWidth="2" />
          <circle cx="260" cy="260" r="6" fill="#2DD4BF" />
          <circle cx="260" cy="260" r="10" stroke="#5EEAD4" strokeWidth="1" strokeDasharray="2 2" />
        </svg>

        {/* Selected Authority Quick Drawer Overlay */}
        {selectedNode && (
          <div
            role="region"
            aria-live="polite"
            aria-label={`Regulatory details for ${selectedNode.code}`}
            className="absolute inset-x-3 bottom-3 rounded-xl border border-brand-bright/30 bg-ink-950/95 p-3.5 shadow-2xl backdrop-blur-md transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-brand-bright">
                    {selectedNode.code}
                  </span>
                  <span className="text-xs font-medium text-slate-300">{selectedNode.name}</span>
                </div>
                <div className="text-xs font-mono text-teal-400 mt-0.5">
                  Focus: {selectedNode.domain}
                </div>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                  {selectedNode.description}
                </p>
                <div className="mt-1.5 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Pipeline:</span>{' '}
                  {selectedNode.monitoringType}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="rounded p-1.5 text-slate-400 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright"
                aria-label="Close authority inspector"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Metainfo */}
      <div className="mt-3 flex flex-col gap-1 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-brand-bright" />
          <span>
            Monitored official sources &bull; Securities and Exchange Board of India &bull; Press
            Information Bureau
          </span>
        </div>
        <p className="text-xs text-slate-500">
          This shows our verification process. It is not a live activity feed. ClaimRadar does not
          file claims or collect official filing fees. You act on the official portal.
        </p>
      </div>
    </div>
  );
}
