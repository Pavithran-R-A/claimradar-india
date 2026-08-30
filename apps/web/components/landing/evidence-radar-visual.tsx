'use client';

import * as React from 'react';
import { ShieldCheck, FileCheck2, Search, CheckCircle2, Landmark } from 'lucide-react';
import { cn } from '@claimradar/design-system';

interface RadarNode {
  id: string;
  name: string;
  category: string;
  cx: number;
  cy: number;
  status: 'monitoring' | 'detected' | 'verified';
  activeDocument?: string;
}

const RADAR_NODES: RadarNode[] = [
  {
    id: 'sebi',
    name: 'SEBI',
    category: 'Securities & Recovery',
    cx: 240,
    cy: 110,
    status: 'verified',
    activeDocument: 'Recovery & Refund Portal Notice',
  },
  {
    id: 'rbi',
    name: 'RBI',
    category: 'Banking & Depository',
    cx: 110,
    cy: 210,
    status: 'monitoring',
    activeDocument: 'Unclaimed Deposits / DEA Fund Feed',
  },
  {
    id: 'ibbi',
    name: 'IBBI',
    category: 'Insolvency & Bankruptcy',
    cx: 270,
    cy: 260,
    status: 'monitoring',
    activeDocument: 'Public Announcement Form B/C Stream',
  },
  {
    id: 'pib',
    name: 'PIB',
    category: 'Government Press Releases',
    cx: 160,
    cy: 115,
    status: 'verified',
    activeDocument: 'Consumer Compensation Scheme Order',
  },
  {
    id: 'nclt',
    name: 'NCLT',
    category: 'Company Law Tribunal',
    cx: 140,
    cy: 280,
    status: 'monitoring',
    activeDocument: 'Creditor Claim Notification Feed',
  },
];

const STAGES = [
  { label: 'Signal Detected', desc: 'Continuous official feed monitoring', icon: Search },
  { label: 'Source Checked', desc: 'Authentic PDF / order retrieval', icon: Landmark },
  { label: 'Editorial Review', desc: 'Human verification against claims', icon: FileCheck2 },
  { label: 'Published with Source', desc: 'Direct link to official portal', icon: ShieldCheck },
] as const;

export function EvidenceRadarVisual({ className }: { className?: string }) {
  const [selectedNode, setSelectedNode] = React.useState<RadarNode>(RADAR_NODES[0]!);
  const [activeStage, setActiveStage] = React.useState<number>(3);

  // Cycle through stages gently for storytelling
  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % STAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={cn(
        'relative mx-auto flex w-full max-w-[460px] flex-col rounded-2xl border border-white/10 bg-ink-950/80 p-5 text-white shadow-2xl backdrop-blur-md lg:max-w-[480px]',
        className,
      )}
      aria-label="ClaimRadar Evidence Verification Radar"
    >
      {/* Top Instrument Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-bright opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-bright" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Evidence Radar Instrument
          </span>
        </div>
        <span className="rounded border border-brand-bright/30 bg-brand-bright/10 px-2 py-0.5 text-[11px] font-semibold text-brand-bright">
          5 Official Feeds Active
        </span>
      </div>

      {/* Screen-reader description */}
      <div className="sr-only">
        Interactive evidence radar illustrating continuous official monitoring across SEBI, RBI,
        IBBI, NCLT, and PIB press releases. Official notices are detected, verified by human
        editors, and published with direct links to official portals.
      </div>

      {/* SVG Radar Display */}
      <div className="relative my-4 flex items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-ink-900/90 p-2">
        <svg
          viewBox="0 0 360 360"
          className="h-[260px] w-[260px] sm:h-[300px] sm:w-[300px] select-none"
          aria-hidden="true"
        >
          <defs>
            {/* Sweep gradient */}
            <radialGradient id="radarSweepGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.35" />
              <stop offset="70%" stopColor="#2DD4BF" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="sweepBeam" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Coordinate grid rings */}
          <circle
            cx="180"
            cy="180"
            r="150"
            stroke="rgba(148,163,184,0.15)"
            strokeWidth="1"
            strokeDasharray="3 3"
            fill="none"
          />
          <circle
            cx="180"
            cy="180"
            r="110"
            stroke="rgba(148,163,184,0.2)"
            strokeWidth="1"
            fill="none"
          />
          <circle
            cx="180"
            cy="180"
            r="70"
            stroke="rgba(148,163,184,0.25)"
            strokeWidth="1"
            fill="none"
          />
          <circle
            cx="180"
            cy="180"
            r="30"
            stroke="rgba(45,212,191,0.3)"
            strokeWidth="1"
            fill="none"
          />

          {/* Coordinate axes */}
          <line
            x1="180"
            y1="20"
            x2="180"
            y2="340"
            stroke="rgba(148,163,184,0.15)"
            strokeWidth="1"
          />
          <line
            x1="20"
            y1="180"
            x2="340"
            y2="180"
            stroke="rgba(148,163,184,0.15)"
            strokeWidth="1"
          />

          {/* Diagonal range markers */}
          <line
            x1="67"
            y1="67"
            x2="293"
            y2="293"
            stroke="rgba(148,163,184,0.08)"
            strokeWidth="0.75"
          />
          <line
            x1="67"
            y1="293"
            x2="293"
            y2="67"
            stroke="rgba(148,163,184,0.08)"
            strokeWidth="0.75"
          />

          {/* Rotating Radar Sweep Beam */}
          <g className="origin-[180px_180px] animate-radar-sweep">
            <path d="M180 180 L180 30 A150 150 0 0 1 310 105 Z" fill="url(#sweepBeam)" />
            <line
              x1="180"
              y1="180"
              x2="180"
              y2="30"
              stroke="#2DD4BF"
              strokeWidth="1.5"
              strokeOpacity="0.9"
            />
          </g>

          {/* Center Hub Pip */}
          <circle cx="180" cy="180" r="3" fill="#2DD4BF" />
          <circle
            cx="180"
            cy="180"
            r="7"
            stroke="#2DD4BF"
            strokeWidth="1"
            fill="none"
            className="animate-ping opacity-30 origin-[180px_180px]"
          />

          {/* Monitored Source Beacon Nodes */}
          {RADAR_NODES.map((node) => {
            const isSelected = selectedNode.id === node.id;
            return (
              <g
                key={node.id}
                className="cursor-pointer transition-transform duration-150 hover:scale-110"
                onClick={() => setSelectedNode(node)}
              >
                {/* Outer ping */}
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r="10"
                  fill="none"
                  stroke={isSelected ? '#2DD4BF' : 'rgba(45,212,191,0.4)'}
                  strokeWidth="1"
                  className="animate-beacon-pulse"
                />
                {/* Solid beacon node */}
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r="4.5"
                  fill={isSelected ? '#FFFFFF' : '#2DD4BF'}
                  stroke="#060B14"
                  strokeWidth="1.5"
                />
                {/* Node Text Label */}
                <text
                  x={node.cx + 9}
                  y={node.cy + 4}
                  fill={isSelected ? '#FFFFFF' : '#CBD5E1'}
                  fontSize="10"
                  fontWeight="700"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                  className="select-none tracking-wider"
                >
                  {node.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Active Signal Badge */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 rounded-lg border border-white/10 bg-ink-950/90 p-2.5 backdrop-blur">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-brand-bright">{selectedNode.name}</span>
            <span className="text-[11px] text-slate-400">{selectedNode.category}</span>
          </div>
          <p className="mt-1 truncate text-xs text-slate-200">{selectedNode.activeDocument}</p>
        </div>
      </div>

      {/* 4-Stage Verification Progression Rail */}
      <div className="mt-2">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
          <span>EDITORIAL PIPELINE</span>
          <span className="text-brand-bright">STAGE 0{activeStage + 1} OF 04</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {STAGES.map((s, idx) => {
            const isCurrent = idx === activeStage;
            const isPast = idx < activeStage;
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => setActiveStage(idx)}
                className={cn(
                  'group flex flex-col items-start rounded-md border p-2 text-left transition-all duration-150',
                  isCurrent
                    ? 'border-brand-bright/60 bg-brand-bright/10 text-white'
                    : isPast
                      ? 'border-white/10 bg-white/5 text-slate-300'
                      : 'border-white/5 bg-transparent text-slate-500 hover:text-slate-300',
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wider">0{idx + 1}</span>
                  {isPast && <CheckCircle2 className="h-3 w-3 text-brand-bright" />}
                </div>
                <span className="mt-1 text-[11px] font-bold leading-tight truncate w-full">
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
