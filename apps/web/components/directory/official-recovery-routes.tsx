import {
  officialRecoveryRoutes,
  type RecoveryRouteKind,
} from '@/lib/official-recovery-routes';

const labels: Record<RecoveryRouteKind, string> = {
  'Search for unclaimed money': 'Search existing money',
  'Claim or track your money': 'Claim or track',
  'Report a dispute': 'Consumer redress',
};

export function OfficialRecoveryRoutes() {
  const routes = officialRecoveryRoutes();

  return (
    <section aria-labelledby="recovery-pathways-title" className="mt-9">
      <div className="max-w-3xl">
        <p className="editorial-kicker">Start with your situation</p>
        <h2
          id="recovery-pathways-title"
          className="mt-1 font-display text-2xl font-bold tracking-tight text-text-primary"
        >
          Where could your money be?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          Select a recovery route to search or apply on the relevant official website. These
          services are different from ClaimKhoj-approved claim opportunities. We cannot see
          your account balances or determine your eligibility from these links.
        </p>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {routes.map((route) => (
          <article
            key={route.id}
            className="flex flex-col rounded-md border border-border bg-surface p-5"
          >
            <p className="text-[11px] font-bold uppercase tracking-wide text-text-secondary">
              {labels[route.kind]}
            </p>
            <h3 className="mt-2 text-base font-semibold leading-snug text-text-primary">
              {route.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {route.description}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-text-secondary">
              <span className="font-semibold">Next:</span> {route.nextStep}
            </p>
            <div className="mt-auto pt-5">
              <a
                href={route.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex min-h-10 items-center rounded-md border border-trust-primary px-3 py-2 text-xs font-semibold text-trust-primary hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trust-primary"
                aria-label={route.linkLabel + ' — opens the official website in a new tab'}
              >
                {route.linkLabel} ↗
              </a>
              <p className="mt-2 text-[11px] text-text-muted">{route.agency}</p>
            </div>
          </article>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-text-secondary">
        ClaimKhoj is an independent information service, not a government portal. Finding a
        service is not evidence that money is owed to you. Never share your OTP or passwords
        with ClaimKhoj.
      </p>
    </section>
  );
}
