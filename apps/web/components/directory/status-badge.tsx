'use client';

import * as React from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock, AlertTriangle, XCircle, HelpCircle, Eye } from 'lucide-react';
import { cn } from '@claimradar/design-system';
import type { DisplayStatus } from '@/lib/claimables-repository';

export type ExtendedStatus = DisplayStatus | 'closing_today' | 'expired' | 'no_deadline';

interface StatusConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  className: string;
}

const STATUS_CONFIGS: Record<string, StatusConfig> = {
  open: {
    label: 'Open for claims',
    icon: CheckCircle2,
    className:
      'border-emerald-700/20 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/30',
  },
  closing_soon: {
    label: 'Closing soon',
    icon: Clock,
    className:
      'border-amber-700/30 bg-amber-50 text-amber-900 font-bold dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-500/40',
  },
  closing_today: {
    label: 'Closing today',
    icon: AlertTriangle,
    className:
      'border-amber-700/40 bg-amber-100 text-amber-950 font-bold dark:bg-amber-900/60 dark:text-amber-200 dark:border-amber-500/50 animate-pulse',
  },
  under_review: {
    label: 'Under review',
    icon: Eye,
    className:
      'border-cyan-700/20 bg-cyan-50 text-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-500/30',
  },
  expired: {
    label: 'Filing window closed',
    icon: XCircle,
    className:
      'border-rose-700/20 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-500/30',
  },
  closed: {
    label: 'Closed',
    icon: XCircle,
    className:
      'border-slate-300 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  },
  no_deadline: {
    label: 'No deadline recorded',
    icon: HelpCircle,
    className:
      'border-slate-300 bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800',
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: ExtendedStatus | string;
  className?: string;
}) {
  const config = (STATUS_CONFIGS[status] ?? STATUS_CONFIGS.open)!;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold tracking-wide select-none',
        config.className,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}

export function MetaPill({
  children,
  href,
  className,
}: {
  children: React.ReactNode;
  href?: string | undefined;
  className?: string;
}) {
  const base =
    'inline-flex items-center rounded-md border border-border bg-surface-strong px-2.5 py-1 text-xs font-medium text-text-secondary transition-colors';

  if (href) {
    return (
      <Link
        href={href}
        className={cn(base, 'hover:border-trust-primary hover:text-trust-primary', className)}
      >
        {children}
      </Link>
    );
  }
  return <span className={cn(base, className)}>{children}</span>;
}
