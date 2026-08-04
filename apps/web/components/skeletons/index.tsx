import { Skeleton } from '@claimradar/design-system';

export function ClaimCardSkeleton() {
  return (
    <div
      className="rounded-lg border border-border bg-surface p-5"
      aria-label="Loading claim card"
      role="status"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="w-full">
          <Skeleton variant="text" className="h-4 w-32" />
          <Skeleton variant="text" className="mt-2 h-3 w-full" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton variant="text" className="mt-4 h-3 w-3/4" />
      <div className="mt-4 flex items-center justify-between">
        <Skeleton variant="text" className="h-3 w-20" />
        <Skeleton variant="text" className="h-3 w-24" />
      </div>
    </div>
  );
}

export function ClaimListSkeleton() {
  return (
    <div
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Loading claims"
      role="status"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <ClaimCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CompanyCardSkeleton() {
  return (
    <div
      className="rounded-lg border border-border bg-surface p-5"
      aria-label="Loading company card"
      role="status"
    >
      <div className="flex items-center gap-3">
        <Skeleton variant="avatar" />
        <div>
          <Skeleton variant="text" className="h-4 w-28" />
          <Skeleton variant="text" className="mt-1.5 h-3 w-20" />
        </div>
      </div>
      <Skeleton variant="text" className="mt-4 h-3 w-full" />
      <Skeleton variant="text" className="mt-2 h-3 w-2/3" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading dashboard" role="status">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-surface p-4">
            <Skeleton variant="text" className="h-3 w-20" />
            <Skeleton className="mt-3 h-8 w-16" />
          </div>
        ))}
      </div>
      <ClaimListSkeleton />
    </div>
  );
}

export function MatchListSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading matches" role="status">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <Skeleton variant="text" className="h-4 w-40" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton variant="text" className="mt-2 h-3 w-full" />
          <Skeleton variant="text" className="mt-1 h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function TrackerSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading tracker" role="status">
      <div className="rounded-lg border border-border bg-surface p-6">
        <Skeleton variant="text" className="h-5 w-48" />
        <Skeleton variant="text" className="mt-4 h-3 w-full" />
        <Skeleton variant="text" className="mt-2 h-3 w-3/4" />
        <div className="mt-6 flex gap-3">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-surface p-4">
            <Skeleton variant="text" className="h-3 w-24" />
            <Skeleton variant="text" className="mt-2 h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminTableSkeleton() {
  return (
    <div
      className="rounded-lg border border-border bg-surface"
      aria-label="Loading table"
      role="status"
    >
      {/* Header row */}
      <div className="flex gap-4 border-b border-border p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="text" className="h-3 flex-1" />
        ))}
      </div>
      {/* Data rows */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex gap-4 border-b border-border p-4 last:border-0">
          {Array.from({ length: 5 }).map((_, j) => (
            <Skeleton key={j} variant="text" className="h-3 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-3" aria-label="Loading search results" role="status">
      <div className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton variant="text" className="h-4 flex-1" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-surface p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Skeleton variant="text" className="h-4 w-36" />
              <Skeleton variant="text" className="mt-1.5 h-3 w-64" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
