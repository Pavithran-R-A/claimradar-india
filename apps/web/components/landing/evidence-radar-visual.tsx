'use client';

import * as React from 'react';
import { ShieldCheck } from 'lucide-react';
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
    description: 'Statutory investor compensation, recovery proceedings & disgorgement funds.',
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
    description: 'Unclaimed deposits, banking ombudsman schemes & depositor relief circulars.',
    monitoringType: 'Statutory Circulars & Press Releases',
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
    description:
      'Statutory corporate insolvency claims windows, forms B/C/D & liquidation notices.',
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
      'Consumer compensation directives, telecom provider penalty distributions & refunds.',
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
      'Official union ministry compensation announcements, tribunal settlements & gazettes.',
    monitoringType: 'Official Government Press Dispatches',
  },
];

export function EvidenceRadarVisual({ className }: { className?: string }) {
  const [selectedNode, setSelectedNode] = React.useState<AuthorityNode | null>(null);

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
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-brand-bright">
            MONITORED REGULATORY NETWORK
          </span>
        </div>
        <span className="text-[11px] font-medium text-slate-400">Official Feeds Only</span>
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
            stroke="rgba(45, 212, 191, 0.18)"
            strokeWidth="1"
            strokeDasharray="2 4"
          />

          {/* Range Ring 2 (Document Verified) */}
          <circle cx="260" cy="260" r="120" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />

          {/* Range Ring 1 (Notice Ingestion Core) */}
          <circle cx="260" cy="260" r="65" stroke="rgba(45, 212, 191, 0.3)" strokeWidth="1.2" />

          {/* Precision Crosshair Coordinate Axes */}
          <line
            x1="260"
            y1="20"
            x2="260"
            y2="500"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <line
            x1="20"
            y1="260"
            x2="500"
            y2="260"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />

          {/* Diagonal Axis Guides */}
          <line
            x1="90"
            y1="90"
            x2="430"
            y2="430"
            stroke="rgba(255, 255, 255, 0.04)"
            strokeWidth="1"
          />
          <line
            x1="430"
            y1="90"
            x2="90"
            y2="430"
            stroke="rgba(255, 255, 255, 0.04)"
            strokeWidth="1"
          />

          {/* Rotating Radar Sweep Beam (CSS animated) */}
          <g className="animate-radar-sweep origin-[260px_260px]">
            <path d="M260 260 L490 260 A230 230 0 0 0 422 98 Z" fill="url(#sweepGradient)" />
            <line
              x1="260"
              y1="260"
              x2="490"
              y2="260"
              stroke="#2DD4BF"
              strokeWidth="1.5"
              strokeOpacity="0.75"
            />
          </g>

          {/* Connected Evidence Pipeline Trail */}
          <path
            d="M260 65 Q330 110 405 145 T260 260 T135 385"
            stroke="rgba(45, 212, 191, 0.2)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Range Horizon Labels */}
          <text x="264" y="275" fill="rgba(148, 163, 184, 0.6)" fontSize="9" fontFamily="monospace">
            01 INGEST
          </text>
          <text x="264" y="195" fill="rgba(148, 163, 184, 0.6)" fontSize="9" fontFamily="monospace">
            02 VERIFY
          </text>
          <text x="264" y="135" fill="rgba(148, 163, 184, 0.6)" fontSize="9" fontFamily="monospace">
            03 REVIEW
          </text>
          <text x="264" y="45" fill="rgba(148, 163, 184, 0.6)" fontSize="9" fontFamily="monospace">
            04 ACTIONABLE
          </text>

          {/* 5 Official Monitored Authority Nodes */}
          {MONITORED_NODES.map((node) => {
            const isSelected = selectedNode?.code === node.code;
            return (
              <g
                key={node.code}
                className="cursor-pointer group"
                onClick={() => setSelectedNode(isSelected ? null : node)}
                tabIndex={0}
                role="button"
                aria-label={`Inspect official source ${node.code}: ${node.name}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedNode(isSelected ? null : node);
                  }
                }}
              >
                {/* Connecting lead line from center */}
                <line
                  x1="260"
                  y1="260"
                  x2={node.cx}
                  y2={node.cy}
                  stroke={isSelected ? '#2DD4BF' : 'rgba(45, 212, 191, 0.15)'}
                  strokeWidth={isSelected ? '1.5' : '1'}
                />

                {/* Outer Beacon Pulse Ring */}
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r="14"
                  fill="none"
                  stroke="#2DD4BF"
                  strokeWidth="1"
                  className="animate-beacon-ping origin-center opacity-60"
                />

                {/* Static Outer Halo */}
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r="9"
                  fill="#0A1322"
                  stroke={isSelected ? '#FFFFFF' : '#2DD4BF'}
                  strokeWidth={isSelected ? '2' : '1.5'}
                />

                {/* Solid Core Dot */}
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r="4.5"
                  fill={isSelected ? '#FFFFFF' : '#2DD4BF'}
                />

                {/* Node Code Label */}
                <text
                  x={node.labelX}
                  y={node.labelY}
                  textAnchor={node.textAnchor}
                  fill={isSelected ? '#FFFFFF' : '#F1F5F9'}
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="monospace"
                  className="transition-colors group-hover:fill-brand-bright"
                >
                  {node.code}
                </text>

                {/* Subtitle Domain */}
                <text
                  x={node.labelX}
                  y={node.labelY + 12}
                  textAnchor={node.textAnchor}
                  fill="rgba(148, 163, 184, 0.85)"
                  fontSize="9"
                  fontWeight="500"
                >
                  {node.domain}
                </text>
              </g>
            );
          })}

          {/* Central Civic Radar Hub */}
          <g>
            <circle
              cx="260"
              cy="260"
              r="24"
              fill="#060B14"
              stroke="#2DD4BF"
              strokeWidth="2"
              className="drop-shadow-[0_0_8px_rgba(45,212,191,0.4)]"
            />
            <circle
              cx="260"
              cy="260"
              r="16"
              fill="#0A1322"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
            />
            <circle cx="260" cy="260" r="4" fill="#2DD4BF" />
          </g>
        </svg>

        {/* Selected Source Detail Drawer / Tooltip overlay */}
        {selectedNode && (
          <div className="absolute inset-x-3 bottom-3 rounded-xl border border-brand-bright/40 bg-ink-950/95 p-3.5 shadow-2xl backdrop-blur-md transition-all duration-200">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-brand-bright/15 px-1.5 py-0.5 text-xs font-mono font-bold text-brand-bright">
                    {selectedNode.code}
                  </span>
                  <span className="text-xs font-bold text-white tracking-tight">
                    {selectedNode.name}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                  {selectedNode.description}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Coverage: {selectedNode.monitoringType}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                aria-label="Close source info"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Grounded Regulatory Guarantee Strip */}
      <div className="mt-3.5 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-brand-bright shrink-0" />
          <span className="text-[11px] sm:text-xs">
            100% human-verified against official gazettes & orders.
          </span>
        </div>
        <span className="hidden sm:inline-block font-mono text-[10px] uppercase text-slate-400">
          Zero Hallucinations
        </span>
      </div>
    </div>
  );
}
