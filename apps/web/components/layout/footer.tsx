import Link from 'next/link';

const footerColumns = [
  {
    title: 'Discover',
    links: [
      { href: '/claimables', label: 'Latest claimables' },
      { href: '/companies', label: 'Companies' },
      { href: '/closing-soon', label: 'Closing soon' },
      { href: '/sectors', label: 'Sectors' },
      { href: '/states', label: 'States' },
      { href: '/guides', label: 'Guides' },
    ],
  },
  {
    title: 'Product',
    links: [
      { href: '/how-it-works', label: 'How it works' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/claimables', label: 'Watchlists' },
      { href: '/updates', label: 'Alerts' },
      { href: '/methodology', label: 'Methodology' },
      { href: '/sources', label: 'Sources' },
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
      { href: '/privacy', label: 'Privacy' },
      { href: '/refund-policy', label: 'Refund policy' },
      { href: '/subscription-policy', label: 'Subscription policy' },
      { href: '/cookie-policy', label: 'Cookie policy' },
      { href: '/acceptable-use', label: 'Acceptable use' },
    ],
  },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Column grid */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:gap-12">
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer bottom */}
        <div className="mt-12 border-t border-border pt-8">
          <p className="text-sm leading-relaxed text-text-muted">
            ClaimRadar India is an independent information platform. It is not affiliated with the
            Government of India, any court, regulator or listed company unless expressly stated.
          </p>
          <div className="mt-6 flex flex-col gap-4 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <a
                href="mailto:support@claimradar.example"
                className="transition-colors hover:text-text-secondary"
              >
                support@claimradar.example
              </a>
              <Link href="/sitemap.xml" className="transition-colors hover:text-text-secondary">
                Sitemap
              </Link>
              <span>Made for consumers in India</span>
            </div>
            <p>© {year} ClaimRadar India. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
