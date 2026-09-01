'use client';

import * as React from 'react';
import Link from 'next/link';
import { BrandMark as DSBrandMark } from '@claimradar/design-system';
import { cn } from '@claimradar/design-system';

export interface BrandProps {
  size?: 'sm' | 'md' | 'lg';
  showDescriptor?: boolean;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
}

export function ClaimRadarBrand({
  size = 'md',
  showDescriptor = true,
  className,
  theme = 'auto',
}: BrandProps) {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <Link
      href="/"
      className={cn(
        'group inline-flex items-center gap-2.5 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-primary focus-visible:ring-offset-2 rounded-lg',
        className,
      )}
      aria-label="ClaimRadar India — Homepage"
    >
      <DSBrandMark
        size={isSm ? 26 : isLg ? 36 : 30}
        variant={theme === 'dark' ? 'default' : theme === 'light' ? 'light' : 'default'}
        animated={false}
        className="transition-transform duration-200 group-hover:scale-105"
      />
      <div className="flex flex-col leading-none">
        <span
          className={cn(
            'font-extrabold tracking-tight',
            isSm ? 'text-base' : isLg ? 'text-xl' : 'text-lg',
          )}
        >
          ClaimRadar
        </span>
        {showDescriptor && (
          <span
            className={cn(
              'text-xs font-bold uppercase tracking-widest',
              theme === 'dark' ? 'text-trust-primary' : 'text-trust-primary',
            )}
          >
            India
          </span>
        )}
      </div>
    </Link>
  );
}
