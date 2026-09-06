'use client';

import * as React from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

/**
 * Accessible bottom-sheet filter drawer for small screens.
 *
 * - `role="dialog"` + `aria-modal`, labelled by its heading.
 * - Escape closes; the scrim closes; focus moves in on open and back to the
 *   trigger on close.
 * - Body scroll is locked while open.
 * - The drawer content is rendered inside the page's `<form>`, so the
 *   standard "Apply filters" submit performs a normal GET navigation —
 *   no client-side data fetching.
 */
export function MobileFilterDrawer({
  activeCount,
  children,
}: {
  activeCount: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
      if (event.key === 'Tab' && panelRef.current) {
        // Minimal focus trap between the panel's focusable controls.
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'button, input, select, a[href]',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      (previouslyFocused ?? triggerRef.current)?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-field border border-border bg-surface px-4 text-sm font-semibold text-text-primary transition-colors duration-fast hover:border-trust-primary hover:text-trust-primary lg:hidden"
      >
        <SlidersHorizontal aria-hidden className="h-4 w-4" />
        Filters{activeCount > 0 ? ` (${activeCount})` : ''}
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          {/* Scrim */}
          <div
            aria-hidden
            className="absolute inset-0 bg-surface/60"
            onClick={() => setOpen(false)}
          />
          {/* Sheet */}
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filter-title"
            className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-background p-5 pb-8 shadow-panel"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 id="mobile-filter-title" className="text-base font-semibold text-text-primary">
                Filter claimables
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="inline-flex h-10 w-10 items-center justify-center rounded-field text-text-muted transition-colors duration-fast hover:bg-surface-strong hover:text-text-primary"
              >
                <X aria-hidden className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">{children}</div>
          </div>
        </div>
      )}
    </>
  );
}
