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
    className: 'border-success/30 bg-verified-background text-success font-semibold',
  },
  closing_soon: {
    label: 'Closing soon',
    icon: Clock,
    className: 'border-deadline/40 bg-deadline-background text-deadline font-bold',
  },
  closing_today: {
    label: 'Closing today',
    icon: AlertTriangle,
    className: 'border-danger/40 bg-danger/10 text-danger font-bold animate-pulse',
  },
  under_review: {
    label: 'Under review',
    icon: Eye,
    className: 'border-trust-primary/30 bg-trust-primary/10 text-trust-primary font-semibold',
  },
  expired: {
    label: 'Filing window closed',
    icon: XCircle,
    className: 'border-danger/30 bg-danger/10 text-danger font-semibold',
  },
  closed: {
    label: 'Closed',
    icon: XCircle,
    className: 'border-border bg-surface-strong text-text-muted',
  },
  no_deadline: {
    label: 'No deadline recorded',
    icon: HelpCircle,
    className: 'border-border bg-surface-strong text-text-secondary',
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
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs select-none transition-colors duration-140',
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
    'inline-flex items-center rounded-md border border-border bg-surface-strong px-2.5 py-1 text-xs font-medium text-text-secondary transition-all duration-140 hover:border-trust-primary hover:text-trust-primary';

  if (href) {
    return (
      <Link href={href} className={cn(base, className)}>
        {children}
      </Link>
    );
  }

  return <span className={cn(base, className)}>{children}</span>;
}
