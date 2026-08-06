import Link from 'next/link';
import { Radar } from 'lucide-react';

/**
 * Shared shell for login, register, password reset and email verification.
 * Calm, single-column, token-only styling; the decorative backdrop is pure
 * CSS (grid + soft trust-tinted wash) and collapses under reduced motion.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-backdrop relative flex min-h-screen flex-col">
      <header className="relative z-10 border-b border-border">
        <div className="mx-auto flex h-14 w-full max-w-md items-center gap-2 px-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-trust-primary/15">
            <Radar className="h-4 w-4 text-trust-primary" aria-hidden />
          </span>
          <h1 className="text-sm font-semibold text-text-primary">
            ClaimRadar <span className="font-normal text-text-muted">India</span>
          </h1>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <div className="anim-fade w-full max-w-md">
          <div className="rounded-card border border-border bg-surface p-6 shadow-card sm:p-8">
            {children}
          </div>
          <p className="mt-6 text-center text-xs leading-relaxed text-text-muted">
            We only ever ask for low-risk answers — never documents, IDs or payment details.{' '}
            <Link href="/" className="text-trust-primary hover:underline">
              Learn how matching works
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
