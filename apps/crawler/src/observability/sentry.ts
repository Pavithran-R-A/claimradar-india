/**
 * Optional Sentry integration.
 *
 * Only initialises when a SENTRY_DSN is provided.
 * All calls are safe no-ops when Sentry is not configured.
 */

let sentryEnabled = false;

/**
 * Initialise Sentry if a DSN is provided.
 * Uses dynamic import so the @sentry/node package is optional.
 */
export async function initSentry(dsn?: string): Promise<void> {
  if (!dsn) {
    sentryEnabled = false;
    return;
  }

  try {
    // Dynamic import — @sentry/node is an optional peer dependency
    const Sentry = await (Function('return import("@sentry/node")')() as Promise<{
      init(opts: Record<string, unknown>): void;
      captureException(err: Error, opts?: Record<string, unknown>): void;
    }>);
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
      environment: process.env.NODE_ENV ?? 'production',
    });
    sentryEnabled = true;
  } catch {
    // @sentry/node is not installed — silently degrade
    sentryEnabled = false;
  }
}

/**
 * Capture an error to Sentry (no-op if not initialised).
 */
export function captureError(error: Error, context?: Record<string, unknown>): void {
  if (!sentryEnabled) return;

  Function('return import("@sentry/node")')()
    .then((Sentry: { captureException(err: Error, opts?: Record<string, unknown>): void }) => {
      if (context) {
        Sentry.captureException(error, { extra: context });
      } else {
        Sentry.captureException(error);
      }
    })
    .catch(() => {
      // swallow — Sentry is best-effort
    });
}
