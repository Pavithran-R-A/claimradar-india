import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cva } from 'class-variance-authority';
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

  const bgFill = isLight ? '#060B14' : isDark ? '#FFFFFF' : isSignal ? '#0F766E' : '#0A1322';
  const primaryStroke = isMonochrome
    ? 'currentColor'
    : isDark
      ? '#0F766E'
      : isSignal
        ? '#FFFFFF'
        : '#2DD4BF';
  const secondaryStroke = isMonochrome
    ? 'currentColor'
    : isDark
      ? '#94A3B8'
      : isSignal
        ? 'rgba(255,255,255,0.7)'
        : '#5EEAD4';
  const ringStroke = isMonochrome
    ? 'currentColor'
    : isDark
      ? 'rgba(15,118,110,0.25)'
      : isSignal
        ? 'rgba(255,255,255,0.25)'
        : 'rgba(45,212,191,0.25)';

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0 select-none', className)}
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

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-trust-primary text-white shadow-sm hover:bg-trust-primary-hover hover:shadow',
        outline:
          'border border-border bg-surface text-text-primary hover:bg-surface-strong hover:border-trust-primary/40',
        ghost: 'text-text-secondary hover:bg-surface-strong hover:text-text-primary',
        secondary: 'bg-surface-strong text-text-primary hover:bg-border/60',
        signal: 'bg-brand-bright text-ink-950 font-bold hover:bg-white hover:shadow-md',
        danger: 'bg-danger text-white hover:bg-danger/90',
      },
      size: {
        default: 'h-11 min-h-[44px] px-5 py-2.5',
        sm: 'h-9 min-h-[36px] px-3.5 text-xs',
        lg: 'h-12 min-h-[48px] px-7 text-base',
        icon: 'h-11 w-11 min-h-[44px] min-w-[44px] p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'signal' | 'danger';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

/* -------------------------------------------------------------------------- */
/*  Badge                                                                      */
/* -------------------------------------------------------------------------- */

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-trust-primary',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-trust-primary text-white',
        secondary: 'border-border bg-surface-strong text-text-secondary',
        success: 'border-success/20 bg-verified-background text-success',
        deadline: 'border-deadline/30 bg-deadline-background text-deadline font-bold',
        warning: 'border-deadline/30 bg-deadline-background text-deadline font-bold',
        danger: 'border-danger/20 bg-danger/10 text-danger font-bold',
        info: 'border-info/20 bg-info/10 text-info',
        neutral: 'border-border bg-surface text-text-muted',
        signal: 'border-brand-bright/30 bg-brand-bright/10 text-brand-bright font-bold',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'default'
    | 'secondary'
    | 'success'
    | 'deadline'
    | 'warning'
    | 'danger'
    | 'info'
    | 'neutral'
    | 'signal';
}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

/* -------------------------------------------------------------------------- */
/*  Card                                                                       */
/* -------------------------------------------------------------------------- */

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-border bg-surface p-6 shadow-sm transition-all duration-150',
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

/* -------------------------------------------------------------------------- */
/*  Input                                                                      */
/* -------------------------------------------------------------------------- */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
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
          className={cn(
            'h-11 min-h-[44px] w-full rounded-lg border border-border bg-surface px-3.5 text-base sm:text-sm text-text-primary placeholder:text-text-muted focus:border-trust-primary focus:outline-none focus:ring-2 focus:ring-trust-primary/20 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
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
            'h-11 min-h-[44px] w-full appearance-none rounded-lg border border-border bg-surface px-3.5 text-base sm:text-sm text-text-primary focus:border-trust-primary focus:outline-none focus:ring-2 focus:ring-trust-primary/20 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
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
            'min-h-[100px] w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-base sm:text-sm text-text-primary placeholder:text-text-muted focus:border-trust-primary focus:outline-none focus:ring-2 focus:ring-trust-primary/20 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
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
/*  Tooltip                                                                    */
/* -------------------------------------------------------------------------- */

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
  return (
    <span className={cn('group relative inline-block', className)}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 ring-1 ring-white/10"
      >
        {content}
      </span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Separator                                                                  */
/* -------------------------------------------------------------------------- */

export interface SeparatorProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
}

export function Separator({ className, orientation = 'horizontal', ...props }: SeparatorProps) {
  return (
    <hr
      className={cn(
        'border-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Container                                                                  */
/* -------------------------------------------------------------------------- */

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'content';
}

const containerSizes: Record<string, string> = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  content: 'max-w-content',
};

export function Container({ className, size = 'content', ...props }: ContainerProps) {
  return (
    <div
      className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', containerSizes[size], className)}
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
/*  Re-exports                                                                 */
/* -------------------------------------------------------------------------- */

export { buttonVariants, badgeVariants };
