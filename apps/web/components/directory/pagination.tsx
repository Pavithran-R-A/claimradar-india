import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@claimradar/design-system';

interface PaginationProps {
  /** Base path without query, e.g. "/claimables". */
  basePath: string;
  /** Extra query params preserved across pages (without "page"). */
  query?: Record<string, string | undefined>;
  page: number;
  totalPages: number;
}

function pageHref(basePath: string, query: Record<string, string | undefined>, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/** Windowed page numbers around the current page (max 7 slots). */
function pageWindow(page: number, totalPages: number): (number | 'gap')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  if (page <= 3) pages.add(2).add(3).add(4);
  if (page >= totalPages - 2)
    pages
      .add(totalPages - 1)
      .add(totalPages - 2)
      .add(totalPages - 3);
  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push('gap');
    out.push(p);
    prev = p;
  }
  return out;
}

export function Pagination({ basePath, query = {}, page, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null;

  const linkClass =
    'inline-flex h-10 min-w-10 items-center justify-center rounded-field border border-border bg-surface px-3 text-sm font-medium text-text-secondary transition-colors duration-fast hover:border-trust-primary hover:text-trust-primary';

  return (
    <nav aria-label="Search results pages" className="mt-10 flex justify-center">
      <ul className="flex flex-wrap items-center gap-2">
        <li>
          {page > 1 ? (
            <Link
              href={pageHref(basePath, query, page - 1)}
              className={linkClass}
              aria-label="Previous page"
            >
              <ChevronLeft aria-hidden className="h-4 w-4" />
            </Link>
          ) : (
            <span aria-hidden className={cn(linkClass, 'pointer-events-none opacity-40')}>
              <ChevronLeft className="h-4 w-4" />
            </span>
          )}
        </li>
        {pageWindow(page, totalPages).map((p, i) =>
          p === 'gap' ? (
            <li key={`gap-${i}`} aria-hidden className="px-1 text-sm text-text-muted">
              …
            </li>
          ) : (
            <li key={p}>
              {p === page ? (
                <span
                  aria-current="page"
                  className="inline-flex h-10 min-w-10 items-center justify-center rounded-field bg-trust-primary px-3 text-sm font-semibold text-white"
                >
                  {p}
                </span>
              ) : (
                <Link
                  href={pageHref(basePath, query, p)}
                  className={linkClass}
                  aria-label={`Page ${p}`}
                >
                  {p}
                </Link>
              )}
            </li>
          ),
        )}
        <li>
          {page < totalPages ? (
            <Link
              href={pageHref(basePath, query, page + 1)}
              className={linkClass}
              aria-label="Next page"
            >
              <ChevronRight aria-hidden className="h-4 w-4" />
            </Link>
          ) : (
            <span aria-hidden className={cn(linkClass, 'pointer-events-none opacity-40')}>
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
