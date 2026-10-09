/**
 * Notification providers (quest §28).
 *
 * - email: ConsoleEmailProvider today (dev preview); ResendEmailProvider is a
 *   scaffold behind RESEND_API_KEY and is NOT activated outside production.
 * - browser: BrowserInboxProvider writes the in-app notifications row.
 * - dev-console: DevConsoleProvider prints a full preview of every message.
 * - whatsapp: WhatsAppPlaceholderProvider — interface only, throws
 *   not-implemented.
 *
 * Provider selection is env-driven: EMAIL_PROVIDER=console is the default.
 */

import { createHash } from 'node:crypto';
import type { NotificationChannel, ProviderSendResult, RenderedMessage } from './types';
import type { NotificationConfig } from './config';
import { isProductionEmailAllowed } from './safety';

export interface NotificationProvider {
  readonly name: string;
  readonly channel: NotificationChannel;
  /** True only for providers that send to external systems / real inboxes. */
  readonly sendsExternally: boolean;
  send(message: RenderedMessage): Promise<ProviderSendResult>;
}

/* ---------------------------------------------------------------------------
 * Email — console (dev preview)
 * ------------------------------------------------------------------------- */

/**
 * Console email provider: renders the email to the server console instead of
 * sending it. This is the default everywhere until a real SMTP/ESP provider
 * is approved for production.
 */
export class ConsoleEmailProvider implements NotificationProvider {
  readonly name = 'console-email';
  readonly channel = 'email' as const;
  readonly sendsExternally = false;

  constructor(private readonly from: string = 'ClaimKhoj <alerts@claimkhoj.app>') {}

  async send(message: RenderedMessage): Promise<ProviderSendResult> {
    const lines = [
      `[email:console] from=${this.from} to=${message.toEmail ?? message.userId}`,
      `[email:console] subject=${message.subject}`,
      `[email:console] body=${message.body}`,
    ];
    if (message.unsubscribeUrl) lines.push(`[email:console] unsubscribe=${message.unsubscribeUrl}`);
    console.info(lines.join('\n'));
    return { ok: true, providerMessageId: `console:${Date.now()}` };
  }
}

/* ---------------------------------------------------------------------------
 * Email — Resend adapter (scaffold, not activated)
 * ------------------------------------------------------------------------- */

/**
 * Resend adapter scaffold. Only instantiated by selectEmailProvider when
 * EMAIL_PROVIDER=resend, RESEND_API_KEY is present AND APP_ENV=production.
 * Until production email is approved the console provider is used instead.
 */
export class ResendEmailProvider implements NotificationProvider {
  readonly name = 'resend-email';
  readonly channel = 'email' as const;
  readonly sendsExternally = true;

  constructor(
    private readonly options: { apiKey: string; from: string; siteUrl?: string | null },
  ) {}

  async send(message: RenderedMessage): Promise<ProviderSendResult> {
    if (!message.toEmail) {
      return { ok: false, error: 'recipient_email_missing' };
    }
    try {
      const body = message.unsubscribeUrl
        ? `${message.body}\n\n---\nUnsubscribe: ${message.unsubscribeUrl}`
        : message.body;
      // A deterministic key prevents duplicate delivery after transient retries.
      const idempotencyKey = message.dedupKey
        ? createHash('sha256').update(`${message.userId}:${message.dedupKey}:email`).digest('hex')
        : null;
      const base = this.options.siteUrl ?? 'https://claimkhoj.app';
      const safeLink =
        message.link?.startsWith('/') && !message.link.startsWith('//')
          ? new URL(message.link, base).toString()
          : null;
      const template =
        message.type === 'new_match' && safeLink
          ? {
              id: 'claimkhoj_verified_opportunity',
              variables: {
                CLAIM_TITLE: message.subject,
                ISSUING_AUTHORITY: 'Official-source listing',
                CLAIM_URL: safeLink,
                PREFERENCES_URL: message.unsubscribeUrl ?? `${base}/app/settings`,
              },
            }
          : null;
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.options.apiKey}`,
          'Content-Type': 'application/json',
          ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
        },
        body: JSON.stringify({
          from: this.options.from,
          to: [message.toEmail],
          subject: message.subject,
          ...(template ? { template } : { subject: message.subject, text: body }),
        }),
      });
      if (!response.ok) {
        return { ok: false, error: `resend_http_${response.status}` };
      }
      const payload = (await response.json()) as { id?: string };
      return {
        ok: true,
        ...(payload.id !== undefined ? { providerMessageId: payload.id } : {}),
      };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : 'resend_send_failed' };
    }
  }
}

/**
 * Selects the email provider from configuration.
 *
 * Real Resend delivery requires EMAIL_PROVIDER=resend + RESEND_API_KEY +
 * APP_ENV=production. Every other combination — including staging with a
 * Resend key — falls back to the console preview so staging email never
 * reaches real customers.
 */
export function selectEmailProvider(config: NotificationConfig): NotificationProvider {
  if (
    config.emailProvider === 'resend' &&
    config.resendApiKey &&
    isProductionEmailAllowed(config.appEnv) &&
    config.externalDeliveryEnabled !== false
  ) {
    return new ResendEmailProvider({
      apiKey: config.resendApiKey,
      from: config.emailFrom,
      siteUrl: config.siteUrl,
    });
  }
  return new ConsoleEmailProvider(config.emailFrom);
}

/* ---------------------------------------------------------------------------
 * Browser — in-app notifications row
 * ------------------------------------------------------------------------- */

/** Minimal writer implemented by the notification store. */
export interface InAppNotificationWriter {
  insertInAppNotification(row: {
    userId: string;
    type: string;
    title: string;
    body: string | null;
    claimableId: string | null;
  }): Promise<string>;
}

/**
 * Browser provider: persists the notification as an in-app inbox row
 * (notifications table). This is the channel the /app/notifications inbox
 * reads from.
 */
export class BrowserInboxProvider implements NotificationProvider {
  readonly name = 'browser-inbox';
  readonly channel = 'browser' as const;
  readonly sendsExternally = false;

  constructor(private readonly writer: InAppNotificationWriter) {}

  async send(message: RenderedMessage): Promise<ProviderSendResult> {
    const notificationId = await this.writer.insertInAppNotification({
      userId: message.userId,
      type: message.type,
      title: message.subject,
      body: message.body || null,
      claimableId: message.claimableId ?? null,
    });
    return { ok: true, providerMessageId: notificationId };
  }
}

/* ---------------------------------------------------------------------------
 * Dev console — full message preview
 * ------------------------------------------------------------------------- */

/**
 * Dev console provider: prints a framed preview of the complete message.
 * Used as a mirror in non-production environments so every notification is
 * inspectable without external delivery.
 */
export class DevConsoleProvider implements NotificationProvider {
  readonly name = 'dev-console';
  readonly channel = 'email' as const;
  readonly sendsExternally = false;

  async send(message: RenderedMessage): Promise<ProviderSendResult> {
    console.info(
      [
        '┌─ notification preview ─────────────────────────',
        `│ type:     ${message.type}`,
        `│ user:     ${message.userId}`,
        `│ subject:  ${message.subject}`,
        `│ body:     ${message.body}`,
        ...(message.link ? [`│ link:     ${message.link}`] : []),
        '└────────────────────────────────────────────────',
      ].join('\n'),
    );
    return { ok: true };
  }
}

/* ---------------------------------------------------------------------------
 * WhatsApp — placeholder (interface only)
 * ------------------------------------------------------------------------- */

/**
 * WhatsApp placeholder provider: implements the provider interface but throws
 * not-implemented. Preference gating in the engine keeps it dormant until a
 * real integration exists.
 */
export class WhatsAppPlaceholderProvider implements NotificationProvider {
  readonly name = 'whatsapp-placeholder';
  readonly channel = 'whatsapp' as const;
  readonly sendsExternally = true;

  async send(): Promise<ProviderSendResult> {
    throw new Error('WhatsApp notifications are not implemented');
  }
}
