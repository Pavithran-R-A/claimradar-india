'use client';

import * as React from 'react';
import { cn } from '@claimradar/design-system';

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delayMs?: number;
  yOffset?: number;
  durationMs?: number;
  as?: React.ElementType;
}

export function Reveal({
  children,
  delayMs = 0,
  yOffset = 12,
  durationMs = 400,
  className,
  as: Component = 'div',
  ...props
}: RevealProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // If user prefers reduced motion, show immediately
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0.1 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <Component
      ref={ref}
      style={{
        transitionDuration: `${durationMs}ms`,
        transitionDelay: `${delayMs}ms`,
        transform: isVisible ? 'none' : `translateY(${yOffset}px)`,
        opacity: isVisible ? 1 : 0,
      }}
      className={cn(
        'transition-all ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:!opacity-100 motion-reduce:!transform-none',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

interface RevealGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  staggerMs?: number;
  baseDelayMs?: number;
  yOffset?: number;
  as?: React.ElementType;
}

export function RevealGroup({
  children,
  staggerMs = 50,
  baseDelayMs = 0,
  yOffset = 12,
  className,
  as: Component = 'div',
  ...props
}: RevealGroupProps) {
  return (
    <Component className={className} {...props}>
      {React.Children.map(children, (child, idx) => {
        if (!React.isValidElement(child)) return child;
        return (
          <Reveal delayMs={baseDelayMs + idx * staggerMs} yOffset={yOffset}>
            {child}
          </Reveal>
        );
      })}
    </Component>
  );
}
