'use client';

import * as React from 'react';
import {
  BarChart3,
  Building2,
  FileText,
  Landmark,
  Radio,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { BrandMark, cn } from '@claimradar/design-system';

interface AuthorityNode {
  code: string;
  name: string;
  domain: string;
  shortDomain: string;
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
    shortDomain: 'Investor Recovery',
    cx: 118,
    cy: 330,
    labelX: 86,
    labelY: 326,
    textAnchor: 'end',
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
    shortDomain: 'Unclaimed Deposits',
    cx: 128,
    cy: 166,
    labelX: 96,
    labelY: 160,
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
    shortDomain: 'Creditor Claims',
    cx: 398,
    cy: 166,
    labelX: 430,
    labelY: 160,
    textAnchor: 'start',
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
    shortDomain: 'Consumer Relief',
    cx: 402,
    cy: 334,
    labelX: 434,
    labelY: 330,
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
    shortDomain: 'Union Notices',
    cx: 260,
    cy: 82,
    labelX: 260,
    labelY: 39,
    textAnchor: 'middle',
    description: 'Official union ministry compensation announcements and public releases.',
    monitoringType: 'Official Government Press Dispatches',
    delaySec: 0.5,
    accent: '#2563EB',
    pale: '#EAF1FF',
    icon: Building2,
  },
];

const DEFAULT_NODE_INDEX = 1;
const SCAN_INTERVAL_MS = 5500;

function SourceSpotlight({ node, compact = false }: { node: AuthorityNode; compact?: boolean }) {
  const Icon = node.icon;

  return (
    <div
      data-ui="radar-status"
      role="region"
      aria-live="off"
      aria-label={`${node.code} source highlight`}
      className={cn(
        'relative overflow-hidden rounded-[var(--public-radius-card)] border border-[#d3e1e8] bg-white shadow-[0_14px_34px_rgba(13,33,72,0.075)]',
        compact ? 'p-4' : 'p-4 xl:p-5',
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: node.pale, color: node.accent }}
        >
          <Icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-[0.61rem] font-extrabold uppercase tracking-[0.16em] text-[#2B648F]">
            Now highlighting
          </p>
          <p className="mt-0.5 font-display text-lg font-bold leading-tight text-trust-primary">
            {node.code}
          </p>
          <p className="mt-0.5 truncate text-xs text-text-muted">{node.name}</p>
        </div>
      </div>

      <h3 className="mt-4 font-display text-lg font-bold leading-tight text-trust-primary">
        {node.domain}
      </h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{node.description}</p>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#DDECF2]" aria-hidden="true">
        <span
          key={node.code}
          className="radar-status-progress block h-full rounded-full bg-[#0F8B8D]"
        />
      </div>
      <div className="mt-2 text-[0.67rem] leading-4 text-text-muted">
        <span>Animated source overview</span>
        <span className="mt-0.5 block truncate text-text-secondary">{node.monitoringType}</span>
      </div>
    </div>
  );
}

function RadarCanvas({
  selectedIndex,
  onSelect,
  compact = false,
}: {
  selectedIndex: number;
  onSelect: (index: number) => void;
  compact?: boolean;
}) {
  const gradientId = `claimkhoj-beam-${React.useId().replace(/:/g, '')}`;

  return (
    <div className={cn('relative aspect-square w-full', compact ? 'mx-auto max-w-[410px]' : 'min-w-0')}>
      <svg viewBox="0 0 520 520" className="h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="260" y1="260" x2="485" y2="260" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F5B940" stopOpacity="0.04" />
            <stop offset="55%" stopColor="#F5B940" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#F5B940" stopOpacity="0.38" />
          </linearGradient>
        </defs>

        <circle cx="260" cy="260" r="220" fill="#FCFEFF" stroke="#8DB4D1" strokeWidth="1" strokeDasharray="5 7" />
        {[72, 138, 202].map((radius, index) => (
          <circle
            key={radius}
            cx="260"
            cy="260"
            r={radius}
            fill="none"
            stroke={index === 2 ? '#B8D0E2' : '#D8E5ED'}
            strokeWidth="1"
            strokeOpacity={index === 2 ? 0.85 : 0.95}
          />
        ))}
        <circle cx="260" cy="260" r="105" fill="#F6FBFE" fillOpacity="0.72" stroke="#CFE0EA" strokeWidth="1" />
        <line x1="260" y1="40" x2="260" y2="480" stroke="#CADCE7" strokeDasharray="3 5" />
        <line x1="40" y1="260" x2="480" y2="260" stroke="#CADCE7" strokeDasharray="3 5" />

        <g data-ui="radar-rotor" className="radar-sweep-rotor">
          <path d="M260 260 L480 260 A220 220 0 0 0 415.6 104.4 Z" fill={`url(#${gradientId})`} />
          <line x1="260" y1="260" x2="480" y2="260" stroke="#D99A18" strokeWidth="1.6" strokeLinecap="round" />
        </g>

        {MONITORED_NODES.map((node, index) => {
          const isSelected = selectedIndex === index;
          return (
            <g key={node.code} className="pointer-events-none">
              <line
                x1="260"
                y1="260"
                x2={node.cx}
                y2={node.cy}
                stroke={node.accent}
                strokeOpacity={isSelected ? 0.32 : 0.13}
                strokeWidth={isSelected ? 1.4 : 1}
                strokeDasharray="2 4"
              />
              <circle
                cx={node.cx}
                cy={node.cy}
                r={isSelected ? 25 : 22}
                fill={node.pale}
                stroke={node.accent}
                strokeWidth={isSelected ? 2.2 : 1.2}
              />
              <circle
                cx={node.cx}
                cy={node.cy}
                r="30"
                fill="none"
                stroke={node.accent}
                strokeWidth="1.2"
                className="animate-detection-blip"
                style={{ animationDelay: `${node.delaySec}s`, transformOrigin: `${node.cx}px ${node.cy}px` }}
              />
              <text
                x={node.labelX}
                y={node.labelY}
                textAnchor={node.textAnchor}
                className="select-none fill-trust-primary font-display text-[12px] font-bold"
              >
                {node.code}
              </text>
              <text
                x={node.labelX}
                y={node.labelY + 15}
                textAnchor={node.textAnchor}
                className="select-none fill-text-muted font-sans text-[8.5px] font-medium"
              >
                {node.shortDomain}
              </text>
            </g>
          );
        })}
      </svg>

      <div role="group" aria-label="Monitored official sources" className="absolute inset-0">
        {MONITORED_NODES.map((node, index) => {
          const isSelected = selectedIndex === index;
          const Icon = node.icon;
          return (
            <button
              key={node.code}
              type="button"
              aria-pressed={isSelected}
              aria-label={`Inspect ${node.code}: ${node.name}`}
              onClick={() => onSelect(index)}
              className="public-focus group/node absolute flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
              style={{ left: `${(node.cx / 520) * 100}%`, top: `${(node.cy / 520) * 100}%` }}
            >
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-fast group-hover/node:-translate-y-0.5 group-hover/node:scale-105"
                style={{ color: node.accent }}
              >
                <Icon className="h-[19px] w-[19px]" strokeWidth={2} />
              </span>
            </button>
          );
        })}
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 flex h-[104px] w-[104px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-[#c9dce7] bg-white/95 text-center shadow-[0_12px_30px_rgba(13,33,72,0.11)] backdrop-blur-sm">
        <BrandMark size={34} variant="light" />
        <span className="mt-1 font-display text-sm font-bold text-trust-primary">ClaimKhoj</span>
        <span className="mt-0.5 max-w-[82px] text-[0.42rem] font-bold uppercase tracking-[0.15em] text-text-muted">
          Official source scan
        </span>
      </div>

      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-bright shadow-[0_0_0_8px_rgba(245,185,64,0.08)]"
        aria-hidden="true"
      />
    </div>
  );
}

export function EvidenceRadarVisual({ className }: { className?: string }) {
  const [selectedIndex, setSelectedIndex] = React.useState(DEFAULT_NODE_INDEX);
  const [motionAllowed, setMotionAllowed] = React.useState(true);
  const selectedNode = MONITORED_NODES[selectedIndex] ?? MONITORED_NODES[DEFAULT_NODE_INDEX]!;

  React.useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotionPreference = () => setMotionAllowed(!media.matches);
    syncMotionPreference();
    media.addEventListener('change', syncMotionPreference);
    return () => media.removeEventListener('change', syncMotionPreference);
  }, []);

  React.useEffect(() => {
    if (!motionAllowed) return undefined;
    const timer = window.setTimeout(() => {
      setSelectedIndex((current) => (current + 1) % MONITORED_NODES.length);
    }, SCAN_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [selectedIndex, motionAllowed]);

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setSelectedIndex(DEFAULT_NODE_INDEX);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className={cn('relative mx-auto w-full max-w-[720px] select-none', className)}
      aria-label="Monitored official sources diagram"
    >
      <div data-ui="radar-desktop" className="hidden xl:grid xl:grid-cols-[minmax(0,1fr)_200px] xl:items-center xl:gap-4 2xl:grid-cols-[minmax(0,1fr)_220px] 2xl:gap-5">
        <RadarCanvas selectedIndex={selectedIndex} onSelect={setSelectedIndex} />
        <div className="relative">
          <SourceSpotlight node={selectedNode} />
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-border/80 bg-[#F8FCFD] px-3 py-2.5 text-[0.68rem] leading-4 text-text-muted">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-trust-primary" aria-hidden="true" />
            <p>
              Visual scan preview, not live crawl status. Every published listing is checked against its official source.
            </p>
          </div>
        </div>
      </div>

      <div data-ui="radar-mobile" className="xl:hidden">
        <div className="rounded-[var(--public-radius-card)] border border-border/80 bg-[#FBFDFE] p-2 shadow-[0_12px_32px_rgba(13,33,72,0.05)] sm:p-3">
          <RadarCanvas selectedIndex={selectedIndex} onSelect={setSelectedIndex} compact />
        </div>
        <div className="mt-3">
          <SourceSpotlight node={selectedNode} compact />
        </div>
        <p className="mt-2 px-1 text-[0.68rem] leading-4 text-text-muted">
          Animated source overview, not live crawl status. Select any source node to inspect its monitoring scope.
        </p>
      </div>
    </div>
  );
}
