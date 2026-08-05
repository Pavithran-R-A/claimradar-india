import Link from 'next/link';
import { CheckCircle2, X } from 'lucide-react';

export const metadata = {
  title: 'Pricing — ClaimRadar India',
  description:
    'Simple, transparent pricing. Free forever or upgrade to Plus for unlimited features.',
};

const features = [
  { name: 'Browse all published claimables', free: true, plus: true },
  { name: 'Search by company or sector', free: true, plus: true },
  { name: 'View deadlines and source links', free: true, plus: true },
  { name: 'Watchlist companies', free: '1 company', plus: 'Unlimited' },
  { name: 'Email digest', free: 'Weekly', plus: 'Real-time' },
  { name: 'Push notifications', free: false, plus: true },
  { name: 'Closing-soon priority alerts', free: false, plus: true },
  { name: 'Detailed source breakdowns', free: false, plus: true },
  { name: 'Export listing data', free: false, plus: true },
  { name: 'Personalised match score', free: false, plus: true },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-base text-text-secondary sm:text-lg">
          Start free. Upgrade when you need more.
        </p>
      </div>

      {/* Plans */}
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:mx-auto lg:max-w-3xl">
        {/* Free */}
        <div className="rounded-xl border border-border bg-surface p-8">
          <p className="text-sm font-semibold text-text-muted">Free</p>
          <p className="mt-3 text-4xl font-bold text-text-primary">₹0</p>
          <p className="mt-1 text-sm text-text-muted">Forever free</p>
          <p className="mt-6 text-sm text-text-secondary">
            Browse all opportunities and stay informed with weekly digests.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-lg border border-border text-sm font-semibold text-text-primary transition-colors hover:bg-surface-strong"
          >
            Get Started
          </Link>
        </div>

        {/* Plus */}
        <div className="relative rounded-xl border border-trust-primary bg-surface p-8">
          <span className="absolute -top-3 left-8 rounded-full bg-trust-primary px-3 py-0.5 text-xs font-semibold text-white">
            Popular
          </span>
          <p className="text-sm font-semibold text-trust-primary">Plus</p>
          <p className="mt-3 text-4xl font-bold text-text-primary">
            ₹149<span className="text-lg font-normal text-text-muted">/mo</span>
          </p>
          <p className="mt-1 text-sm text-text-muted">or ₹999/year (save 44%)</p>
          <p className="mt-6 text-sm text-text-secondary">
            Unlimited watchlists, real-time alerts and deep source insights.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-lg bg-trust-primary text-sm font-semibold text-white transition-colors hover:bg-trust-primary-hover"
          >
            Upgrade to Plus
          </Link>
        </div>
      </div>

      {/* Feature comparison table */}
      <div className="mt-16">
        <h2 className="text-center text-2xl font-bold tracking-tight text-text-primary">
          Feature comparison
        </h2>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-4 pr-4 text-left font-medium text-text-muted">Feature</th>
                <th className="px-4 py-4 text-center font-medium text-text-muted">Free</th>
                <th className="px-4 py-4 text-center font-medium text-trust-primary">Plus</th>
              </tr>
            </thead>
            <tbody>
              {features.map((f) => (
                <tr key={f.name} className="border-b border-border">
                  <td className="py-3.5 pr-4 text-text-secondary">{f.name}</td>
                  <td className="px-4 py-3.5 text-center">
                    {typeof f.free === 'string' ? (
                      <span className="text-text-secondary">{f.free}</span>
                    ) : f.free ? (
                      <CheckCircle2 className="mx-auto h-5 w-5 text-success" />
                    ) : (
                      <X className="mx-auto h-5 w-5 text-text-muted" />
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {typeof f.plus === 'string' ? (
                      <span className="text-text-secondary">{f.plus}</span>
                    ) : f.plus ? (
                      <CheckCircle2 className="mx-auto h-5 w-5 text-success" />
                    ) : (
                      <X className="mx-auto h-5 w-5 text-text-muted" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pricing FAQ */}
      <div className="mx-auto mt-20 max-w-3xl">
        <h2 className="text-center text-2xl font-bold tracking-tight text-text-primary">
          Pricing FAQ
        </h2>
        <div className="mt-8 divide-y divide-border">
          {[
            {
              q: 'Is the free plan really free?',
              a: 'Yes. The free plan is free forever. No credit card required. You get access to browse all published claimables, search, and a basic watchlist.',
            },
            {
              q: 'Can I switch between monthly and annual billing?',
              a: 'Yes. You can switch between monthly (₹149/mo) and annual (₹999/yr) billing at any time. The change takes effect at the start of your next billing cycle.',
            },
            {
              q: 'What happens if I cancel Plus?',
              a: 'Your Plus features remain active until the end of your current billing period. After that, your account reverts to the Free tier. Your watchlist data is preserved.',
            },
            {
              q: 'Do you offer discounts for students or NGOs?',
              a: 'We are evaluating special pricing for students, NGOs and senior citizens. Contact us at support@claimradar.example if you are interested.',
            },
            {
              q: 'Is my payment information secure?',
              a: 'Yes. Payment processing is handled by a PCI-DSS compliant payment provider. We never store your full card numbers or bank details on our servers.',
            },
          ].map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="flex cursor-pointer items-center justify-between gap-4 py-2 text-left text-sm font-medium text-text-primary [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="shrink-0 text-text-muted transition-transform group-open:rotate-180">
                  ▾
                </span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
