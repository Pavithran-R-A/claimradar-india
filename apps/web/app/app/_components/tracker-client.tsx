'use client';

import { useState, useTransition } from 'react';
import { Button, cn } from '@claimradar/design-system';
import { Trash2 } from 'lucide-react';
import { TRACKER_STATUSES, trackerStatusMeta } from '@/lib/constants';
import type { TrackerRow } from '@/lib/user-data';
import { deleteTracker, updateTracker } from '../actions';
import { TrackerStatusBadge, formatDate } from './badges';

type ActionResultLike = { ok: boolean; message?: string; error?: string };

function buildFormData(data: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) formData.set(key, value);
  return formData;
}

export function TrackerItem({ tracker }: { tracker: TrackerRow }) {
  const [status, setStatus] = useState(tracker.status);
  const [notes, setNotes] = useState(tracker.notes ?? '');
  const [externalReference, setExternalReference] = useState(tracker.external_reference ?? '');
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<ActionResultLike | null>(null);

  const statusMeta = trackerStatusMeta(status);
  const isSubmittedExternally = status === 'submitted_externally';

  function handleSave() {
    setFeedback(null);
    const formData = buildFormData({
      trackerId: tracker.id,
      status,
      notes,
      externalReference,
    });
    startTransition(async () => {
      setFeedback(await updateTracker(formData));
    });
  }

  function handleDelete() {
    setFeedback(null);
    const formData = buildFormData({ trackerId: tracker.id });
    startTransition(async () => {
      setFeedback(await deleteTracker(formData));
    });
  }

  const inputClass =
    'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-trust-primary focus:outline-none focus:ring-1 focus:ring-trust-primary';

  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <a
            href={tracker.claimable ? `/claimables/${tracker.claimable.slug}` : '#'}
            className="text-sm font-semibold text-text-primary hover:text-trust-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-primary"
          >
            {tracker.claimable?.public_title ?? 'Claimable unavailable'}
          </a>
          <p className="mt-0.5 text-xs text-text-muted">
            {tracker.claimable?.company_name ?? 'Unknown company'} · updated{' '}
            {formatDate(tracker.updated_at)}
          </p>
        </div>
        <TrackerStatusBadge status={tracker.status} />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`status-${tracker.id}`}
            className="mb-1 block text-xs font-medium text-text-secondary"
          >
            Status
          </label>
          <select
            id={`status-${tracker.id}`}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className={inputClass}
            disabled={pending}
          >
            {TRACKER_STATUSES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {statusMeta && (
            <p
              className={cn(
                'mt-1 text-xs text-text-muted',
                isSubmittedExternally && 'text-deadline',
              )}
            >
              {statusMeta.description}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor={`ref-${tracker.id}`}
            className="mb-1 block text-xs font-medium text-text-secondary"
          >
            External reference (your own filing ID — optional)
          </label>
          <input
            id={`ref-${tracker.id}`}
            value={externalReference}
            onChange={(event) => setExternalReference(event.target.value)}
            placeholder="e.g. complaint number you received"
            className={inputClass}
            disabled={pending}
            maxLength={200}
          />
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor={`notes-${tracker.id}`}
            className="mb-1 block text-xs font-medium text-text-secondary"
          >
            Private notes (never shown publicly)
          </label>
          <textarea
            id={`notes-${tracker.id}`}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={2}
            maxLength={2000}
            className={inputClass}
            disabled={pending}
          />
        </div>
      </div>

      {feedback && !feedback.ok && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {feedback.error}
        </p>
      )}
      {feedback && feedback.ok && (
        <p role="status" className="mt-2 text-sm text-success">
          {feedback.message ?? 'Saved.'}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" onClick={handleSave} disabled={pending}>
          {pending ? 'Saving…' : 'Save changes'}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDelete}
          disabled={pending}
          aria-label="Remove from tracker"
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          Remove
        </Button>
      </div>
    </li>
  );
}
