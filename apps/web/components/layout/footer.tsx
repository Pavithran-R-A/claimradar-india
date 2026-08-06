import Link from 'next/link';
import { brandConfig } from '@claimradar/config';

const footerColumns = [
  {
    title: 'Discover',
    links: [
      { href: '/claimables', label: 'Claimables directory' },
      { href: '/new', label: 'Newly published' },
      { href: '/closing-soon', label: 'Closing soon' },
      { href: '/deadlines', label: 'Deadline calendar' },
      { href: '/companies', label: 'Companies' },
      { href: '/sectors', label: 'Sectors' },
    ],
  },
  {
    title: 'Product',
    links: [
      { href: '/how-it-works', label: 'How it works' },
      { href: '/methodology', label: 'Methodology' },
      { href: '/sources', label: 'Sources' },
      { href: '/guides', label: 'Guides' },
      { href: '/glossary', label: 'Glossary' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
  {
    title: 'Trust & transparency',
    links: [
      { href: '/editorial-policy', label: 'Editorial policy' },
      { href: '/corrections', label: 'Corrections' },
      { href: '/disclaimer', label: 'Disclaimer' },
      { href: '/security', label: 'Security' },
      { href: '/privacy', label: 'Data & privacy' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/terms', label: 'Terms' },
      { href: '/refund-policy', label: 'Refund policy' },
      { href: '/subscription-policy', label: 'Subscription policy' },
      { href: '/cookie-policy', label: 'Cookie policy' },
      { href: '/acceptable-use', label: 'Acceptable use' },
    ],
  },
] as const;

/**
 * Multi-column civic footer on the deep-ink scale. Closes every public page
 * with the independence disclaimer — a mandatory product constraint.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink-950 text-white">
      <div className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          {/* Brand column */}
          <div>
            <p className="flex items-center gap-2.5 text-lg font-bold">
              <span
                aria-hidden
                className="inline-flex h-8 w-8 items-center justify-center rounded-field bg-ink-800 text-xs font-bold text-brand-bright ring-1 ring-ink-700"
              >
                CR
              </span>
              {brandConfig.siteName}
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              An independent information platform tracking refund, compensation and claim
              opportunities from official Indian sources.
            </p>
          </div>

          {footerColumns.map((col) => (
            <nav key={col.title} aria-label={`Footer — ${col.title}`}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-300 transition-colors duration-fast hover:text-brand-bright"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Independence disclaimer */}
        <div className="mt-12 rounded-card border border-ink-700 bg-ink-900 p-5">
          <p className="text-sm leading-relaxed text-slate-300">
            <strong className="font-semibold text-white">Independent platform.</strong>{' '}
            {brandConfig.siteName} is not affiliated with the Government of India, any court,
            tribunal, regulator or company. We publish information from official sources and do not
            file claims on anyone&apos;s behalf. A listing never guarantees eligibility or
            compensation — always verify with the linked official source before acting.
          </p>
        </div>

        {/* Bottom row */}
        <div className="mt-8 flex flex-col gap-4 border-t border-ink-800 pt-8 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <a
              href={`mailto:${brandConfig.supportEmail}`}
              className="transition-colors duration-fast hover:text-slate-200"
            >
              {brandConfig.supportEmail}
            </a>
            <Link
              href="/sitemap.xml"
              className="transition-colors duration-fast hover:text-slate-200"
            >
              Sitemap
            </Link>
            <span>Made for consumers in India</span>
          </div>
          <p>
            © {year} {brandConfig.siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
