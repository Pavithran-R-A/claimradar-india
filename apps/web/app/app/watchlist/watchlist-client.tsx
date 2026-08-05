'use client';

import { useState, useTransition } from 'react';
import { Button } from '@claimradar/design-system';
import { Eye, RotateCcw } from 'lucide-react';
import type { DirectoryOption } from '@/lib/user-data';
import { watchCompany, watchSector } from '../actions';

type ActionResultLike = { ok: boolean; message?: string; error?: string };

interface WatchlistClientProps {
  watchedCompanyIds: string[];
  watchedSectorIds: string[];
  companyOptions: DirectoryOption[];
  sectorOptions: DirectoryOption[];
  companyLimit: number;
  sectorLimit: number;
}

export function WatchlistClient({
  watchedCompanyIds,
  watchedSectorIds,
  companyOptions,
  sectorOptions,
  companyLimit,
  sectorLimit,
}: WatchlistClientProps) {
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<ActionResultLike | null>(null);

  const addableCompanies = companyOptions.filter((o) => !watchedCompanyIds.includes(o.id));
  const addableSectors = sectorOptions.filter((o) => !watchedSectorIds.includes(o.id));

  function run(
    action: (formData: FormData) => Promise<ActionResultLike>,
    data: Record<string, string>,
  ) {
    setFeedback(null);
    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) formData.set(key, value);
    startTransition(async () => {
      setFeedback(await action(formData));
    });
  }

  const selectClass =
    'h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-text-primary focus:border-trust-primary focus:outline-none focus:ring-1 focus:ring-trust-primary';

  return (
    <div className="space-y-4">
      {feedback && !feedback.ok && (
        <p
          role="alert"
          className="rounded-md border border-danger/20 bg-danger/10 p-3 text-sm text-danger"
        >
          {feedback.error}
        </p>
      )}
      {feedback && feedback.ok && feedback.message && (
        <p
          role="status"
          className="rounded-md border border-success/20 bg-verified-background p-3 text-sm text-success"
        >
          {feedback.message}
        </p>
      )}

      {/* Companies */}
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-text-primary">Companies</h2>
          <p className="text-xs text-text-muted">
            {watchedCompanyIds.length} of {companyLimit} used on the free plan
          </p>
        </div>
        <div className="flex gap-2">
          <select
            aria-label="Choose a company to watch"
            value={selectedCompany}
            onChange={(event) => setSelectedCompany(event.target.value)}
            className={selectClass}
            disabled={pending}
          >
            <option value="">
              {addableCompanies.length === 0
                ? 'All published companies already watched'
                : 'Choose a company…'}
            </option>
            {addableCompanies.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          <Button
            type="button"
            disabled={pending || !selectedCompany}
            onClick={() => {
              run(watchCompany, { companyId: selectedCompany });
              setSelectedCompany('');
            }}
          >
            <Eye className="mr-2 h-4 w-4" aria-hidden />
            Watch
          </Button>
        </div>
        {addableCompanies.length > 0 && watchedCompanyIds.length >= companyLimit && (
          <p className="mt-2 text-xs text-deadline">
            Free plan limit reached ({companyLimit}). Remove a company to watch a different one.
          </p>
        )}
      </div>

      {/* Sectors */}
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-text-primary">Sectors</h2>
          <p className="text-xs text-text-muted">
            {watchedSectorIds.length} of {sectorLimit} used on the free plan
          </p>
        </div>
        <div className="flex gap-2">
          <select
            aria-label="Choose a sector to watch"
            value={selectedSector}
            onChange={(event) => setSelectedSector(event.target.value)}
            className={selectClass}
            disabled={pending}
          >
            <option value="">
              {addableSectors.length === 0 ? 'All sectors already watched' : 'Choose a sector…'}
            </option>
            {addableSectors.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          <Button
            type="button"
            disabled={pending || !selectedSector}
            onClick={() => {
              run(watchSector, { sectorId: selectedSector });
              setSelectedSector('');
            }}
          >
            <Eye className="mr-2 h-4 w-4" aria-hidden />
            Watch
          </Button>
        </div>
        {addableSectors.length > 0 && watchedSectorIds.length >= sectorLimit && (
          <p className="mt-2 text-xs text-deadline">
            Free plan limit reached ({sectorLimit}). Remove a sector to watch a different one.
          </p>
        )}
      </div>

      {/* Restore hint */}
      <p className="flex items-start gap-2 rounded-md border border-border bg-background-elevated p-3 text-xs text-text-muted">
        <RotateCcw className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        Removed items are never deleted from the directory — watch them again any time using the
        selectors above.
      </p>
    </div>
  );
}
