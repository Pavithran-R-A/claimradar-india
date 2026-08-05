import Link from 'next/link';
import { Alert, Button, Card, EmptyState } from '@claimradar/design-system';
import { Building2, Layers, X } from 'lucide-react';
import { requireAppAuth } from '@/lib/app-auth';
import { FREE_TIER_LIMITS } from '@/lib/entitlements';
import { getPublishedCompanies, getPublishedSectors, getWatchlist } from '@/lib/user-data';
import { unwatchCompany, unwatchSector } from '../actions';
import { formatDate } from '../_components/badges';
import { WatchlistClient } from './watchlist-client';

export const dynamic = 'force-dynamic';

export default async function WatchlistPage() {
  const user = await requireAppAuth();

  const [watchlist, companyOptions, sectorOptions] = await Promise.all([
    getWatchlist(user.id),
    getPublishedCompanies(),
    getPublishedSectors(),
  ]);

  const optionsUnavailable =
    watchlist.unavailable || (companyOptions.length === 0 && sectorOptions.length === 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Watchlist</h1>
        <p className="mt-1 max-w-2xl text-sm text-text-secondary">
          Follow companies and sectors you care about. New published claimables involving them are
          prioritised in your matches.
        </p>
      </div>

      {watchlist.unavailable && (
        <Alert variant="warning" title="Watchlist temporarily unavailable">
          We could not reach the database. Your watchlist is safe — try again shortly.
        </Alert>
      )}

      <Card>
        {optionsUnavailable ? (
          <EmptyState
            icon={<Building2 className="h-8 w-8" aria-hidden />}
            title="Directory unavailable"
            description="We could not load the published directory right now. Please try again shortly."
          />
        ) : (
          <WatchlistClient
            watchedCompanyIds={watchlist.companies.map((c) => c.company_id)}
            watchedSectorIds={watchlist.sectors.map((s) => s.sector_id)}
            companyOptions={companyOptions}
            sectorOptions={sectorOptions}
            companyLimit={FREE_TIER_LIMITS.companyWatchlist}
            sectorLimit={FREE_TIER_LIMITS.sectorWatchlist}
          />
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Watched companies */}
        <Card className="p-0">
          <div className="border-b border-border px-5 py-4">
            <h2 className="flex items-center gap-2 text-base font-semibold text-text-primary">
              <Building2 className="h-4 w-4 text-trust-primary" aria-hidden />
              Watched companies
            </h2>
          </div>
          {watchlist.companies.length === 0 ? (
            <EmptyState
              className="py-10"
              title="No companies watched"
              description="Add companies above to get ahead of anything new involving them."
            />
          ) : (
            <ul className="divide-y divide-border">
              {watchlist.companies.map((company) => (
                <li key={company.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <Link
                      href={company.slug ? `/companies/${company.slug}` : '/companies'}
                      className="block truncate text-sm font-medium text-text-primary hover:text-trust-primary"
                    >
                      {company.display_name}
                    </Link>
                    <p className="mt-0.5 text-xs text-text-muted">
                      Watching since {formatDate(company.created_at)}
                    </p>
                  </div>
                  <form
                    action={async (formData) => {
                      await unwatchCompany(formData);
                    }}
                  >
                    <input type="hidden" name="companyId" value={company.company_id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      aria-label={`Stop watching ${company.display_name}`}
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Watched sectors */}
        <Card className="p-0">
          <div className="border-b border-border px-5 py-4">
            <h2 className="flex items-center gap-2 text-base font-semibold text-text-primary">
              <Layers className="h-4 w-4 text-trust-primary" aria-hidden />
              Watched sectors
            </h2>
          </div>
          {watchlist.sectors.length === 0 ? (
            <EmptyState
              className="py-10"
              title="No sectors watched"
              description="Add sectors above to catch sector-wide claimables as they appear."
            />
          ) : (
            <ul className="divide-y divide-border">
              {watchlist.sectors.map((sector) => (
                <li key={sector.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <Link
                      href={sector.slug ? `/sectors/${sector.slug}` : '/sectors'}
                      className="block truncate text-sm font-medium text-text-primary hover:text-trust-primary"
                    >
                      {sector.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-text-muted">
                      Watching since {formatDate(sector.created_at)}
                    </p>
                  </div>
                  <form
                    action={async (formData) => {
                      await unwatchSector(formData);
                    }}
                  >
                    <input type="hidden" name="sectorId" value={sector.sector_id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      aria-label={`Stop watching ${sector.name}`}
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
