import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pricing — Free Public Claims Search | ClaimKhoj',
  description:
    'ClaimKhoj is currently free. Browse all verified, published refund and compensation opportunities without payment details or subscriptions.',
};

const included = [
  'Browse all published claimables, regardless of your preferences',
  'Search official sources, companies and sectors',
  'See deadlines, evidence and links to the official claim process',
  'Save a private matching profile and manage a watchlist',
  'Track claims and review your progress',
];

export default function PricingPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-bold uppercase tracking-wide text-trust-primary">
          Clear pricing
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          ClaimKhoj is free during beta
        </h1>
        <p className="mt-4 text-base leading-relaxed text-text-secondary">
          Every published claim opportunity stays visible to everyone. We do not ask for payment
          details or charge a claim filing fee.
        </p>
      </header>

      <section className="mx-auto mt-8 max-w-2xl rounded-xl border border-border bg-surface p-5 shadow-card sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Free access</h2>
            <p className="mt-1 text-sm text-text-secondary">The only currently available plan</p>
          </div>
          <p className="text-3xl font-extrabold text-text-primary">
            ₹0<span className="text-sm font-normal text-text-muted"> / month</span>
          </p>
        </div>
        <ul className="mt-6 space-y-3">
          {included.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm text-text-secondary">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/register"
          className="mt-7 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-trust-primary px-4 py-3 text-sm font-semibold text-white hover:bg-trust-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-primary"
        >
          Get started free
        </Link>
      </section>

      <section className="mx-auto mt-8 max-w-2xl rounded-xl border border-border bg-background-elevated p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-trust-primary" aria-hidden />
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              No payment or notification promises before launch
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Paid subscriptions, checkout, and automated outbound customer email alerts are not
              currently available. In-app notification features may remain empty until they have
              been enabled and genuine claimables are published. Any future paid offering will be
              clearly disclosed before it becomes available.
            </p>
          </div>
        </div>
      </section>

      <p className="mt-8 text-center text-sm text-text-secondary">
        Looking for opportunities?{' '}
        <Link className="font-semibold text-trust-primary underline" href="/claimables">
          Explore all published claims
        </Link>
        .
      </p>
    </div>
  );
}
