'use client';

import * as React from 'react';
import { ShieldCheck, FileCheck2, Search, CheckCircle2, Landmark, Info } from 'lucide-react';
import { cn } from '@claimradar/design-system';
import { publicSourceFamilies, type PublicSourceFamily } from '@claimradar/source-registry';

interface PolarNode {
  family: PublicSourceFamily;
  cx: number;
  cy: number;
}

// Polar positions mapped truthfully to our 5 configured public source families
const POLAR_NODES: PolarNode[] = [
  {
    family: publicSourceFamilies.find((f) => f.id === 'sebi')!,
    cx: 240,
    cy: 110,
  },
  {
    family: publicSourceFamilies.find((f) => f.id === 'rbi')!,
    cx: 110,
    cy: 210,
  },
  {
    family: publicSourceFamilies.find((f) => f.id === 'ibbi')!,
    cx: 265,
    cy: 250,
  },
  {
    family: publicSourceFamilies.find((f) => f.id === 'pib')!,
    cx: 160,
    cy: 110,
  },
  {
    family: publicSourceFamilies.find((f) => f.id === 'trai')!,
    cx: 130,
    cy: 280,
  },
];

const STAGES = [
  { label: 'Signal Detected', desc: 'Monitored official regulatory feeds', icon: Search },
  { label: 'Source Checked', desc: 'Authentic PDF / order verification', icon: Landmark },
  { label: 'Editorial Review', desc: 'Human verification against claims', icon: FileCheck2 },
  { label: 'Published with Source', desc: 'Direct link to official portal', icon: ShieldCheck },
] as const;

export function EvidenceRadarVisual({ className }: { className?: string }) {
  const [selectedNode, setSelectedNode] = React.useState<PolarNode>(POLAR_NODES[0]!);
  const [activeStage, setActiveStage] = React.useState<number>(3);

  // Cycle through conceptual stages gently for storytelling
  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % STAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={cn(
        'relative mx-auto flex w-full max-w-[440px] flex-col rounded-2xl border border-white/10 bg-ink-950/90 p-4 sm:p-5 text-white shadow-2xl backdrop-blur-md lg:max-w-[460px]',
        className,
      )}
      aria-label="ClaimRadar Evidence Verification Radar Diagram"
    >
      {/* Top Conceptual Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brand-bright" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            EVIDENCE RADAR
          </span>
        </div>
        <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
          How ClaimRadar Monitors Sources
        </span>
      </div>

      {/* Screen-reader description */}
      <div className="sr-only">
        Conceptual diagram illustrating how ClaimRadar monitors official Indian regulatory sources
        including SEBI, RBI, IBBI, PIB, and TRAI. Notices are detected, verified by human editors
        against official orders, and published with direct links to official portals.
      </div>

      {/* SVG Radar Display */}
      <div className="relative my-3 flex items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-ink-900/90 p-2">
        <svg
          viewBox="0 0 360 360"
          className="h-[240px] w-[240px] sm:h-[280px] sm:w-[280px] select-none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="sweepBeam" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Range rings */}
          <circle
            cx="180"
            cy="180"
            r="145"
            stroke="rgba(148,163,184,0.15)"
            strokeWidth="1"
            strokeDasharray="3 3"
            fill="none"
          />
          <circle
            cx="180"
            cy="180"
            r="105"
            stroke="rgba(148,163,184,0.2)"
            strokeWidth="1"
            fill="none"
          />
          <circle
            cx="180"
            cy="180"
            r="65"
            stroke="rgba(148,163,184,0.25)"
            strokeWidth="1"
            fill="none"
          />
          <circle
            cx="180"
            cy="180"
            r="25"
            stroke="rgba(45,212,191,0.3)"
            strokeWidth="1"
            fill="none"
          />

          {/* Range axes */}
          <line
            x1="180"
            y1="25"
            x2="180"
            y2="335"
            stroke="rgba(148,163,184,0.12)"
            strokeWidth="1"
          />
          <line
            x1="25"
            y1="180"
            x2="335"
            y2="180"
            stroke="rgba(148,163,184,0.12)"
            strokeWidth="1"
          />

          {/* Rotating Radar Sweep Beam (single restrained motion) */}
          <g className="origin-[180px_180px] animate-radar-sweep motion-reduce:hidden">
            <path d="M180 180 L180 35 A145 145 0 0 1 305 105 Z" fill="url(#sweepBeam)" />
            <line
              x1="180"
              y1="180"
              x2="180"
              y2="35"
              stroke="#2DD4BF"
              strokeWidth="1.2"
              strokeOpacity="0.8"
            />
          </g>

          {/* Center Hub */}
          <circle cx="180" cy="180" r="3" fill="#2DD4BF" />

          {/* Monitored Source Beacon Nodes */}
          {POLAR_NODES.map((node) => {
            const isSelected = selectedNode.family.id === node.family.id;
            return (
              <g
                key={node.family.id}
                className="cursor-pointer transition-transform duration-150 hover:scale-110"
                onClick={() => setSelectedNode(node)}
              >
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r="4.5"
                  fill={isSelected ? '#FFFFFF' : '#2DD4BF'}
                  stroke="#060B14"
                  strokeWidth="1.5"
                />
                <text
                  x={node.cx + 8}
                  y={node.cy + 4}
                  fill={isSelected ? '#FFFFFF' : '#CBD5E1'}
                  fontSize="10"
                  fontWeight="700"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                  className="select-none tracking-wider"
                >
                  {node.family.shortName}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Source Description Box */}
        <div className="absolute bottom-2 left-2 right-2 rounded-lg border border-white/10 bg-ink-950/90 p-2.5 backdrop-blur">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-brand-bright">{selectedNode.family.shortName}</span>
            <span className="text-[10px] text-slate-400">{selectedNode.family.domain}</span>
          </div>
          <p className="mt-0.5 truncate text-[11px] text-slate-200">{selectedNode.family.scope}</p>
        </div>
      </div>

      {/* 4-Stage Verification Progression Rail */}
      <div className="mt-1">
        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-1.5">
          <span>VERIFICATION STAGES</span>
          <span className="text-brand-bright">STAGE 0{activeStage + 1} OF 04</span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {STAGES.map((s, idx) => {
            const isCurrent = idx === activeStage;
            const isPast = idx < activeStage;
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => setActiveStage(idx)}
                className={cn(
                  'group flex flex-col items-start rounded-md border p-1.5 text-left transition-all duration-150',
                  isCurrent
                    ? 'border-brand-bright/60 bg-brand-bright/10 text-white'
                    : isPast
                      ? 'border-white/10 bg-white/5 text-slate-300'
                      : 'border-white/5 bg-transparent text-slate-500 hover:text-slate-300',
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-[9px] font-bold tracking-wider">0{idx + 1}</span>
                  {isPast && <CheckCircle2 className="h-2.5 w-2.5 text-brand-bright" />}
                </div>
                <span className="mt-0.5 text-[10px] font-bold leading-tight truncate w-full">
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visible Truthful Microcopy */}
      <div className="mt-2.5 flex items-center justify-center gap-1 text-[10px] text-slate-400">
        <Info className="h-3 w-3 shrink-0 text-slate-500" />
        <span>Illustration of ClaimRadar&apos;s verification workflow — not live activity.</span>
      </div>
    </div>
  );
}
