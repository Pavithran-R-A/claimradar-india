import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';

/* -------------------------------------------------------------------------- */
/*  Utility                                                                    */
/* -------------------------------------------------------------------------- */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* -------------------------------------------------------------------------- */
/*  BrandMark ("Evidence Radar" Icon & Wordmark Mark)                          */
/* -------------------------------------------------------------------------- */

export interface BrandMarkProps extends React.SVGAttributes<SVGSVGElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  variant?: 'default' | 'light' | 'dark' | 'monochrome' | 'signal';
  animated?: boolean;
}

const brandMarkSizes: Record<string, number> = {
  xs: 20,
  sm: 24,
  md: 32,
  lg: 40,
  xl: 48,
};

export function BrandMark({
  size = 'md',
  variant = 'default',
  animated = false,
  className,
  ...props
}: BrandMarkProps) {
  const pixelSize = typeof size === 'number' ? size : brandMarkSizes[size] || 32;

  const isDark = variant === 'dark';
  const isLight = variant === 'light';
  const isMonochrome = variant === 'monochrome';
  const isSignal = variant === 'signal';

  const bgFill = isLight ? '#FFFFFF' : isDark ? '#FFFFFF' : isSignal ? '#214E80' : '#15171A';
  const primaryStroke = isMonochrome
    ? 'currentColor'
    : isDark
      ? '#214E80'
      : isSignal
        ? '#FFFFFF'
        : '#214E80';
  const secondaryStroke = isMonochrome
    ? 'currentColor'
    : isDark
      ? '#525A65'
      : isSignal
        ? 'rgba(255,255,255,0.7)'
        : '#525A65';
  const ringStroke = isMonochrome
    ? 'currentColor'
    : isDark
      ? 'rgba(33,78,128,0.2)'
      : isSignal
        ? 'rgba(255,255,255,0.25)'
        : 'rgba(217,218,214,0.6)';

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        'shrink-0 select-none transition-transform duration-fast hover:scale-[1.02]',
        className,
      )}
      aria-hidden="true"
      {...props}
    >
      <rect width="32" height="32" rx="7" fill={bgFill} />
      <circle cx="16" cy="16" r="11" stroke={ringStroke} strokeWidth="1" strokeDasharray="2 2" />
      <circle cx="16" cy="16" r="7" stroke={ringStroke} strokeWidth="1" />
      <circle cx="16" cy="16" r="3" stroke={ringStroke} strokeWidth="1" />
      <line x1="16" y1="4" x2="16" y2="28" stroke={ringStroke} strokeWidth="0.75" />
      <line x1="4" y1="16" x2="28" y2="16" stroke={ringStroke} strokeWidth="0.75" />
      <path
        d="M21 11.5C19.8 10 17.8 9 15.5 9C11.9 9 9 11.9 9 15.5C9 19.1 11.9 22 15.5 22C17.5 22 19.3 21.1 20.5 19.8"
        stroke={primaryStroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle
        cx="21"
        cy="11.5"
        r="2.2"
        fill={secondaryStroke}
        className={animated ? 'animate-beacon-pulse origin-[21px_11.5px]' : undefined}
      />
      <circle cx="16" cy="16" r="1" fill={primaryStroke} />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Button                                                                     */
/* -------------------------------------------------------------------------- */

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-fast ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.985] active:translate-y-0 [&_svg]:transition-transform [&_svg]:duration-fast',
  {
    variants: {
      variant: {
        default:
          'bg-trust-primary text-white shadow-xs hover:bg-trust-primary-hover hover:-translate-y-[1px] hover:shadow-sm active:bg-trust-primary-hover active:shadow-xs [&>svg.lucide-arrow-right]:hover:translate-x-0.5',
        outline:
          'border border-border bg-surface text-text-primary hover:bg-surface-strong hover:border-trust-primary hover:text-trust-primary hover:-translate-y-[1px] shadow-xs active:shadow-xs [&>svg.lucide-arrow-right]:hover:translate-x-0.5',
        ghost:
          'text-text-secondary hover:bg-surface-strong hover:text-text-primary hover:-translate-y-[0.5px]',
        secondary:
          'bg-surface-strong text-text-primary border border-border/80 hover:bg-border/60 hover:text-text-primary hover:-translate-y-[0.5px]',
        signal:
          'bg-trust-primary text-white font-bold shadow-xs hover:bg-trust-primary-hover hover:-translate-y-[1px] hover:shadow-sm active:shadow-xs [&>svg.lucide-arrow-right]:hover:translate-x-0.5',
        danger: 'bg-danger text-white shadow-xs hover:bg-danger/90 hover:-translate-y-[1px]',
        official:
          'bg-surface border border-trust-primary text-trust-primary font-semibold hover:bg-trust-primary hover:text-white hover:-translate-y-[1px] shadow-xs [&>svg.lucide-arrow-right]:hover:translate-x-0.5',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs gap-1 rounded',
        sm: 'h-9 min-h-[36px] px-3.5 text-xs gap-1.5',
        default: 'h-11 min-h-[44px] px-5 py-2.5 gap-2',
        lg: 'h-12 min-h-[48px] px-7 text-base gap-2.5 rounded-md',
        icon: 'h-11 w-11 min-h-[44px] min-w-[44px] p-0 hover:scale-[1.04] active:scale-[0.96]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
    );
  },
);
Button.displayName = 'Button';

/* -------------------------------------------------------------------------- */
/*  Badge / Status Pill                                                        */
/* -------------------------------------------------------------------------- */

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-surface-strong text-text-secondary border border-border',
        secondary: 'bg-surface-strong text-text-primary border border-border/80',
        outline: 'border border-border text-text-secondary',
        success: 'bg-verified-background text-success border border-success/30 font-bold',
        warning: 'bg-deadline-background text-deadline border border-deadline/30 font-bold',
        danger: 'bg-danger/10 text-danger border border-danger/30 font-bold',
        info: 'bg-info/10 text-info border border-info/30',
        verified: 'bg-verified-background text-success border border-success/30 font-bold',
        deadline: 'bg-deadline-background text-deadline border border-deadline/30 font-bold',
        urgent: 'bg-danger/10 text-danger border border-danger/30 font-bold animate-pulse',
        neutral: 'bg-surface-strong text-text-muted border border-border/80',
        source: 'bg-ink-900 text-brand-bright border border-brand-bright/30 font-mono text-[11px]',
        signal: 'border-brand-bright/30 bg-brand-bright/10 text-brand-bright font-bold',
        trust: 'bg-trust-primary/10 text-trust-primary border border-trust-primary/25',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

/* -------------------------------------------------------------------------- */
/*  Card                                                                       */
/* -------------------------------------------------------------------------- */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'sunken' | 'ink' | 'glass';
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', interactive = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-md border transition-all duration-fast',
          variant === 'default' && 'bg-surface border-border shadow-card',
          variant === 'elevated' && 'bg-surface border-border shadow-lift',
          variant === 'sunken' && 'bg-background-elevated border-border/60 shadow-none',
          variant === 'ink' && 'bg-ink-950 border-white/10 text-white shadow-panel',
          variant === 'glass' && 'bg-surface/80 backdrop-blur-md border-border/80 shadow-sm',
          interactive &&
            'cursor-pointer hover:border-trust-primary/40 hover:shadow-lift hover:-translate-y-0.5',
          className,
        )}
        {...props}
      />
    );
  },
);
Card.displayName = 'Card';

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 pb-3 flex flex-col gap-1.5', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-base font-bold text-text-primary tracking-tight leading-snug', className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-xs sm:text-sm text-text-secondary leading-relaxed', className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('p-5 pt-3 border-t border-border flex items-center justify-between', className)}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Input                                                                      */
/* -------------------------------------------------------------------------- */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  hasError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, hasError, id, type = 'text', ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const isErr = Boolean(error || hasError);
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold text-text-primary">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          type={type}
          className={cn(
            'h-11 min-h-[44px] w-full rounded-md border border-border bg-surface px-3.5 text-base sm:text-sm text-text-primary placeholder:text-text-muted focus:border-trust-primary focus:outline-none focus:ring-2 focus:ring-trust-primary/20 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
            isErr && 'border-danger focus:border-danger focus:ring-danger/20',
            className,
          )}
          {...props}
        />
        {hint && !error && <p className="mt-1.5 text-xs text-text-muted">{hint}</p>}
        {error && <p className="mt-1.5 text-xs font-semibold text-danger">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';

/* -------------------------------------------------------------------------- */
/*  Select                                                                     */
/* -------------------------------------------------------------------------- */

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, id, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-sm font-semibold text-text-primary"
          >
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            'h-11 min-h-[44px] w-full appearance-none rounded-md border border-border bg-surface px-3.5 text-base sm:text-sm text-text-primary focus:border-trust-primary focus:outline-none focus:ring-2 focus:ring-trust-primary/20 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
            error && 'border-danger focus:border-danger focus:ring-danger/20',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {hint && !error && <p className="mt-1.5 text-xs text-text-muted">{hint}</p>}
        {error && <p className="mt-1.5 text-xs font-semibold text-danger">{error}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';

/* -------------------------------------------------------------------------- */
/*  Textarea                                                                   */
/* -------------------------------------------------------------------------- */

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-1.5 block text-sm font-semibold text-text-primary"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            'w-full rounded-lg border border-border bg-surface p-3.5 text-base sm:text-sm text-text-primary placeholder:text-text-muted focus:border-trust-primary focus:outline-none focus:ring-2 focus:ring-trust-primary/20 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
            error && 'border-danger focus:border-danger focus:ring-danger/20',
            className,
          )}
          {...props}
        />
        {hint && !error && <p className="mt-1.5 text-xs text-text-muted">{hint}</p>}
        {error && <p className="mt-1.5 text-xs font-semibold text-danger">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';

/* -------------------------------------------------------------------------- */
/*  Skeleton                                                                   */
/* -------------------------------------------------------------------------- */

const skeletonVariants = cva('animate-shimmer rounded-lg bg-surface-strong', {
  variants: {
    variant: {
      base: '',
      card: 'h-48 w-full rounded-xl',
      text: 'h-4 w-full',
      avatar: 'h-10 w-10 rounded-full',
    },
  },
  defaultVariants: {
    variant: 'base',
  },
});

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'base' | 'card' | 'text' | 'avatar';
}

export function Skeleton({ className, variant, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(skeletonVariants({ variant }), className)}
      aria-label="Loading..."
      role="status"
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Section                                                                    */
/* -------------------------------------------------------------------------- */

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  heading?: string;
  subheading?: string;
  eyebrow?: string;
}

export function Section({
  className,
  eyebrow,
  heading,
  subheading,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn('py-12 sm:py-16 lg:py-20', className)} {...props}>
      {(heading || subheading || eyebrow) && (
        <div className="mb-8 sm:mb-12">
          {eyebrow && (
            <span className="text-xs font-bold uppercase tracking-wider text-trust-primary">
              {eyebrow}
            </span>
          )}
          {heading && (
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl lg:text-4xl">
              {heading}
            </h2>
          )}
          {subheading && (
            <p className="mt-2.5 max-w-2xl text-base text-text-secondary">{subheading}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Grid                                                                       */
/* -------------------------------------------------------------------------- */

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 6;
  gap?: 'sm' | 'md' | 'lg';
}

const gridCols: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
};

const gridGaps: Record<string, string> = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
};

export function Grid({ className, cols = 3, gap = 'md', ...props }: GridProps) {
  return <div className={cn('grid', gridCols[cols], gridGaps[gap], className)} {...props} />;
}

/* -------------------------------------------------------------------------- */
/*  EmptyState                                                                 */
/* -------------------------------------------------------------------------- */

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  className,
  icon,
  title,
  description,
  action,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-border bg-surface p-8 sm:p-12 text-center shadow-sm',
        className,
      )}
      {...props}
    >
      {icon && <div className="mb-4 text-text-muted">{icon}</div>}
      <h3 className="text-lg font-bold text-text-primary sm:text-xl">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-text-secondary">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Alert                                                                      */
/* -------------------------------------------------------------------------- */

const alertVariants = cva('rounded-xl border p-4 text-sm leading-relaxed', {
  variants: {
    variant: {
      info: 'border-info/20 bg-info/5 text-text-primary',
      success: 'border-success/20 bg-verified-background text-text-primary',
      warning: 'border-deadline/20 bg-deadline-background text-text-primary',
      error: 'border-danger/20 bg-danger/5 text-text-primary',
    },
  },
  defaultVariants: {
    variant: 'info',
  },
});

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
}

export function Alert({ className, variant, title, children, ...props }: AlertProps) {
  return (
    <div className={cn(alertVariants({ variant }), className)} role="alert" {...props}>
      {title && <p className="mb-1 font-bold text-text-primary">{title}</p>}
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  AuthorityBadge                                                             */
/* -------------------------------------------------------------------------- */

const authorityStyles: Record<string, string> = {
  sebi: 'bg-trust-primary/10 text-trust-primary border-trust-primary/25',
  rbi: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20',
  ibbi: 'bg-verified-background text-success border-success/30',
  trai: 'bg-teal-500/10 text-teal-800 border-teal-500/25',
  pib: 'bg-deadline-background text-deadline border-deadline/30',
  default: 'bg-surface-strong text-text-secondary border-border',
};

export interface AuthorityBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  authority: string;
  shortName?: string;
  size?: 'sm' | 'md';
}

export function AuthorityBadge({
  authority,
  shortName,
  size = 'md',
  className,
  ...props
}: AuthorityBadgeProps) {
  const key = authority.toLowerCase();
  const matchedKey = key.includes('sebi')
    ? 'sebi'
    : key.includes('rbi')
      ? 'rbi'
      : key.includes('ibbi')
        ? 'ibbi'
        : key.includes('trai')
          ? 'trai'
          : key.includes('pib')
            ? 'pib'
            : 'default';

  const style = authorityStyles[matchedKey] || authorityStyles.default;
  const label = shortName || authority.toUpperCase();

  return (
    <span
      className={cn(
        'inline-flex items-center font-mono font-bold tracking-wider uppercase rounded border transition-colors',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        style,
        className,
      )}
      {...props}
    >
      {label}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  DecisionCallout                                                            */
/* -------------------------------------------------------------------------- */

export interface DecisionCalloutProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  variant?: 'editorial' | 'official' | 'warning' | 'neutral';
  icon?: React.ReactNode;
}

export function DecisionCallout({
  className,
  title,
  variant = 'editorial',
  icon,
  children,
  ...props
}: DecisionCalloutProps) {
  const variantStyles = {
    editorial: 'border-l-4 border-l-trust-primary bg-surface border border-border/80',
    official: 'border-l-4 border-l-brand-bright bg-surface-strong/80 border border-border',
    warning: 'border-l-4 border-l-deadline bg-deadline-background/40 border border-deadline/20',
    neutral: 'border-l-4 border-l-text-muted bg-surface-strong border border-border',
  };

  return (
    <div
      className={cn(
        'rounded-r-lg p-4 sm:p-5 text-sm leading-relaxed shadow-sm',
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {(title || icon) && (
        <div className="flex items-center gap-2 mb-1.5 font-bold text-text-primary">
          {icon}
          {title && <span>{title}</span>}
        </div>
      )}
      <div className="text-text-secondary text-xs sm:text-sm">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*  Proprietary Visual Primitives: EvidenceThread, SourceStamp, DeadlineTick  */
/* -------------------------------------------------------------------------- */

export interface EvidenceThreadProps extends React.HTMLAttributes<HTMLDivElement> {
  activeStage?: 1 | 2 | 3 | 4;
}

export function EvidenceThread({ className, activeStage = 4, ...props }: EvidenceThreadProps) {
  return (
    <div
      className={cn('relative flex items-center justify-between w-full select-none', className)}
      aria-label="Evidence thread: source to verified official action"
      {...props}
    >
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-border pointer-events-none" />
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-trust-primary transition-all duration-ui pointer-events-none"
        style={{ width: `${(activeStage / 4) * 100}%` }}
      />
      {[
        { stage: 1, label: 'Source' },
        { stage: 2, label: 'Evidence' },
        { stage: 3, label: 'Verified' },
        { stage: 4, label: 'Official Action' },
      ].map((s) => (
        <div
          key={s.stage}
          className="relative z-10 flex flex-col items-center gap-1 bg-surface px-1"
        >
          <div
            className={cn(
              'h-2.5 w-2.5 rounded-full border-2 transition-colors duration-fast',
              s.stage <= activeStage
                ? 'border-trust-primary bg-trust-primary'
                : 'border-border bg-surface',
            )}
          />
          <span
            className={cn(
              'text-[10px] sm:text-xs font-semibold uppercase tracking-wider',
              s.stage <= activeStage ? 'text-trust-primary' : 'text-text-muted',
            )}
          >
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export interface SourceStampProps extends React.HTMLAttributes<HTMLDivElement> {
  authority: string;
  status?: string;
  date?: string;
}

export function SourceStamp({
  authority,
  status = 'SOURCE CHECKED',
  date,
  className,
  ...props
}: SourceStampProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded border border-border bg-surface-strong px-2 py-0.5 text-xs select-none shadow-xs',
        className,
      )}
      {...props}
    >
      <span className="font-mono text-xs font-bold text-trust-primary">{authority}</span>
      <span className="text-border" aria-hidden>
        |
      </span>
      <span className="text-xs font-semibold text-text-primary tracking-wide">{status}</span>
      {date && (
        <>
          <span className="text-border" aria-hidden>
            |
          </span>
          <span className="text-xs text-text-muted">{date}</span>
        </>
      )}
    </div>
  );
}

export interface DeadlineTickProps extends React.HTMLAttributes<HTMLDivElement> {
  daysRemaining?: number | string;
  label?: string;
}

export function DeadlineTick({
  daysRemaining,
  label = 'CLOSING SOON',
  className,
  ...props
}: DeadlineTickProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 border-l-2 border-deadline bg-deadline-background/50 pl-2 pr-2.5 py-0.5 text-xs font-semibold text-deadline select-none',
        className,
      )}
      {...props}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-deadline animate-pulse shrink-0" />
      <span>{label}</span>
      {daysRemaining && <span className="font-mono font-bold">({daysRemaining})</span>}
    </div>
  );
}

/*  End of Design System Exports                                               */
/* -------------------------------------------------------------------------- */
