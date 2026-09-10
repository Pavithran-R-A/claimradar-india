'use client';

import * as React from 'react';
import Link from 'next/link';
import { ClaimRadarBrand } from '@/components/layout/brand-mark';
import { ShieldCheck } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-light relative flex min-h-screen flex-col bg-background text-text-primary">
      {/* Auth Header */}
      <header className="relative z-10 border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-content items-center justify-between px-4 sm:px-6">
          <ClaimRadarBrand size="sm" />
          <Link
            href="/"
            className="text-xs font-semibold text-text-secondary hover:text-trust-primary transition-colors"
          >
            ← Return to homepage
          </Link>
        </div>
      </header>

      {/* Main Auth Content */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-border border-t-2 border-t-trust-primary bg-surface p-6 shadow-card sm:p-8">
            {children}
          </div>

          <div className="mt-6 rounded-xl border border-border/60 bg-surface-strong/60 p-3.5 text-center text-xs text-text-muted">
            <p className="flex items-center justify-center gap-1.5 font-semibold text-text-secondary mb-1">
              <ShieldCheck className="h-4 w-4 text-trust-primary" />
              Privacy-First Platform
            </p>
            We never request Aadhaar, bank credentials, or claim filing fees.
          </div>
        </div>
      </main>
    </div>
  );
}
