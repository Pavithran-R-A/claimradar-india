import Link from 'next/link';
import { CheckCircle2, Clock, Eye, CircleSlash2 } from 'lucide-react';
import type { DisplayStatus } from '@/lib/claimables-repository';
import { cn } from '@claimradar/design-system';

/**
 * Status is always rendered as icon + label so colour alone never carries
 * meaning (WCAG 2.2 AA). Colours follow the design-system status semantics.
 */
const STATUS_META: Record<DisplayStatus, { label: string; icon: typeof Clock; className: string }> =
  {
    open: {
      label: 'Open',
      icon: CheckCircle2,
      className: 'bg-verified-background text-success',
    },
    closing_soon: {
      label: 'Closing soon',
      icon: Clock,
      className: 'bg-deadline-background text-deadline',
    },
    under_review: {
      label: 'Under review',
      icon: Eye,
      className: 'bg-info/10 text-info',
    },
    closed: {
      label: 'Closed',
      icon: CircleSlash2,
      className: 'bg-surface-strong text-text-muted',
    },
  };

export function StatusBadge({ status, className }: { status: DisplayStatus; className?: string }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        'relative inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        meta.className,
        className,
      )}
    >
      <Icon aria-hidden className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
}

export function statusLabel(status: DisplayStatus): string {
  return STATUS_META[status].label;
}

/** Small pill used for sector / category metadata. */
export function MetaPill({
  children,
  href,
}: {
  children: React.ReactNode;
  href?: string | undefined;
}) {
  const className =
    'relative inline-flex items-center rounded-full border border-border bg-surface-strong px-2.5 py-1 text-xs font-medium text-text-secondary transition-colors';
  if (href) {
    return (
      <Link
        href={href}
        className={cn(className, 'hover:border-trust-primary hover:text-trust-primary')}
      >
        {children}
      </Link>
    );
  }
  return <span className={className}>{children}</span>;
}
