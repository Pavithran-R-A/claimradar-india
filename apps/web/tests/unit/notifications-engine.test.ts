import { describe, expect, it } from 'vitest';
import { deliverNotification } from '@/lib/notifications/engine';
import { selectEmailProvider } from '@/lib/notifications/providers';
import type { DeliveryLogEntry, NotificationStore } from '@/lib/notifications/store';
import type {
  ClaimableForNotification,
  NotificationPreferences,
  NotificationType,
  OutboundNotification,
  ProviderSendResult,
  RenderedMessage,
} from '@/lib/notifications/types';
import { DEFAULT_PREFERENCES } from '@/lib/notifications/types';

/* ---------------------------------------------------------------------------
 * In-memory store fake
 * ------------------------------------------------------------------------- */

interface LedgerRow extends DeliveryLogEntry {
  createdAt: Date;
}

class InMemoryStore implements NotificationStore {
  preferences: NotificationPreferences = { ...DEFAULT_PREFERENCES };
  emailByUser = new Map<string, string>([['user-1', 'user-1@example.com']]);
  claimables = new Map<string, ClaimableForNotification>();
  ledger: LedgerRow[] = [];
  inAppRows: Array<{ id: string; userId: string; type: string; title: string }> = [];
  failNextInsert = false;
  private nextId = 1;

  async getPreferences(): Promise<NotificationPreferences> {
    return this.preferences;
  }

  async getUserEmail(userId: string): Promise<string | null> {
    return this.emailByUser.get(userId) ?? null;
  }

  async getClaimable(claimableId: string): Promise<ClaimableForNotification | null> {
    return this.claimables.get(claimableId) ?? null;
  }

  async hasDelivery(userId: string, dedupKey: string, channel: string): Promise<boolean> {
    return this.ledger.some(
      (row) =>
        row.userId === userId &&
        row.dedupKey === dedupKey &&
        row.channel === channel &&
        row.status === 'delivered',
    );
  }

  async countDeliveredKeysSince(
    userId: string,
    type: NotificationType,
    sinceIso: string,
  ): Promise<number> {
    const since = new Date(sinceIso).getTime();
    const keys = new Set(
      this.ledger
        .filter(
          (row) =>
            row.userId === userId &&
            row.notificationType === type &&
            row.status === 'delivered' &&
            row.createdAt.getTime() >= since,
        )
        .map((row) => row.dedupKey),
    );
    return keys.size;
  }

  async insertInAppNotification(row: {
    userId: string;
    type: string;
    title: string;
    body: string | null;
    claimableId: string | null;
  }): Promise<string> {
    if (this.failNextInsert) {
      this.failNextInsert = false;
      throw new Error('in_app_insert_failed');
    }
    const id = `notif-${this.nextId++}`;
    this.inAppRows.push({ id, userId: row.userId, type: row.type, title: row.title });
    return id;
  }

  async recordDelivery(entry: DeliveryLogEntry): Promise<'recorded' | 'duplicate'> {
    const duplicate = this.ledger.some(
      (row) =>
        row.userId === entry.userId &&
        row.dedupKey === entry.dedupKey &&
        row.channel === entry.channel,
    );
    if (duplicate) return 'duplicate';
    this.ledger.push({ ...entry, createdAt: new Date() });
    return 'recorded';
  }
}

function makeNotification(overrides: Partial<OutboundNotification> = {}): OutboundNotification {
  return {
    userId: 'user-1',
    type: 'new_match',
    title: 'New match found',
    body: 'A claimable may apply to you.',
    claimableId: null,
    link: null,
    dedupKey: 'new_match:user-1:claim-x:2026-08-06',
    ...overrides,
  };
}

const devConfig = {
  appEnv: 'development',
  emailProvider: 'console' as const,
  resendApiKey: null,
  emailFrom: 'notifications@claimradar.in',
  siteUrl: null,
  unsubscribeSecret: null,
};

describe('deliverNotification — happy path', () => {
  it('delivers to every enabled channel and records ledger rows', async () => {
    const store = new InMemoryStore();
    const result = await deliverNotification(makeNotification(), store, {}, { config: devConfig });

    expect(result.status).toBe('delivered');
    expect(result.notificationId).toBeTruthy();
    expect(store.inAppRows).toHaveLength(1);
    expect(store.ledger.map((row) => row.channel).sort()).toEqual(['browser', 'email']);
    expect(store.ledger.every((row) => row.status === 'delivered')).toBe(true);
  });

  it('sanitizes the subject before any channel sees it', async () => {
    const store = new InMemoryStore();
    await deliverNotification(
      makeNotification({ title: 'Update for priya@example.com' }),
      store,
      {},
      { config: devConfig },
    );
    expect(store.inAppRows[0]?.title).toBe('Update for');
    expect(store.ledger.every((row) => row.subject === 'Update for')).toBe(true);
  });
});

describe('deliverNotification — dedup + idempotency', () => {
  it('reprocessing the identical trigger never delivers twice', async () => {
    const store = new InMemoryStore();
    const notification = makeNotification();

    const first = await deliverNotification(notification, store, {}, { config: devConfig });
    const second = await deliverNotification(notification, store, {}, { config: devConfig });

    expect(first.status).toBe('delivered');
    expect(second.status).toBe('duplicate');
    expect(store.inAppRows).toHaveLength(1);
    expect(store.ledger).toHaveLength(2); // one browser + one email row total
  });

  it('a different dedup window is delivered separately', async () => {
    const store = new InMemoryStore();
    const first = await deliverNotification(makeNotification(), store, {}, { config: devConfig });
    const second = await deliverNotification(
      makeNotification({ dedupKey: 'new_match:user-1:claim-x:2026-08-07' }),
      store,
      {},
      { config: devConfig, frequencyLimits: { new_match: 10 } },
    );

    expect(first.status).toBe('delivered');
    expect(second.status).toBe('delivered');
    expect(store.inAppRows).toHaveLength(2);
  });
});

describe('deliverNotification — safety suppressions', () => {
  it('dry runs perform zero writes and zero sends', async () => {
    const store = new InMemoryStore();
    const result = await deliverNotification(
      makeNotification(),
      store,
      { dryRun: true },
      { config: devConfig },
    );

    expect(result).toEqual({ status: 'suppressed', reason: 'dry_run', channels: [] });
    expect(store.ledger).toHaveLength(0);
    expect(store.inAppRows).toHaveLength(0);
  });

  it('rejects unknown notification types', async () => {
    const store = new InMemoryStore();
    const result = await deliverNotification(
      makeNotification({ type: 'promo_blast' as never }),
      store,
      {},
      { config: devConfig },
    );
    expect(result.status).toBe('suppressed');
    expect(result.reason).toBe('invalid_type');
  });

  it('suppresses when the referenced claimable no longer exists', async () => {
    const store = new InMemoryStore();
    const result = await deliverNotification(
      makeNotification({ claimableId: 'missing' }),
      store,
      {},
      { config: devConfig },
    );
    expect(result).toEqual({ status: 'suppressed', reason: 'claimable_missing', channels: [] });
  });

  it('never notifies about unpublished claimables', async () => {
    const store = new InMemoryStore();
    store.claimables.set('c-1', {
      id: 'c-1',
      publicationStatus: 'draft',
      publicTitle: 'Draft',
      slug: 'draft',
      status: 'open',
      deadline: null,
      companyId: null,
    });
    const result = await deliverNotification(
      makeNotification({ claimableId: 'c-1' }),
      store,
      {},
      { config: devConfig },
    );
    expect(result.status).toBe('suppressed');
    expect(result.reason).toBe('unpublished_claimable');
    expect(store.inAppRows).toHaveLength(0);
  });

  it('suppresses during quiet hours without writing anything', async () => {
    const store = new InMemoryStore();
    store.preferences = { ...store.preferences, quietHoursStart: '00:00', quietHoursEnd: '23:59' };
    const result = await deliverNotification(
      makeNotification(),
      store,
      { now: new Date(2026, 7, 6, 12, 0) },
      { config: devConfig },
    );
    expect(result.status).toBe('suppressed');
    expect(result.reason).toBe('quiet_hours');
    expect(store.ledger).toHaveLength(0);
  });

  it('drops weekly digests when the user disabled digests', async () => {
    const store = new InMemoryStore();
    store.preferences = { ...store.preferences, digestFrequency: 'never' };
    const result = await deliverNotification(
      makeNotification({ type: 'weekly_digest', dedupKey: 'weekly_digest:user-1:w32' }),
      store,
      {},
      { config: devConfig },
    );
    expect(result.status).toBe('suppressed');
    expect(result.reason).toBe('digest_disabled');
  });

  it('store failures suppress instead of throwing', async () => {
    const store = new InMemoryStore();
    store.failNextInsert = true;
    store.preferences = { ...store.preferences, emailEnabled: false };
    const result = await deliverNotification(makeNotification(), store, {}, { config: devConfig });
    expect(result.status).toBe('suppressed');
    expect(result.reason).toBe('store_error');
  });
});

describe('deliverNotification — frequency limits', () => {
  it('caps deliveries per user per type per UTC day', async () => {
    const store = new InMemoryStore();
    const options = { config: devConfig, frequencyLimits: { new_match: 2 } };

    const first = await deliverNotification(
      makeNotification({ dedupKey: 'k-1' }),
      store,
      {},
      options,
    );
    const second = await deliverNotification(
      makeNotification({ dedupKey: 'k-2' }),
      store,
      {},
      options,
    );
    const third = await deliverNotification(
      makeNotification({ dedupKey: 'k-3' }),
      store,
      {},
      options,
    );

    expect(first.status).toBe('delivered');
    expect(second.status).toBe('delivered');
    expect(third.status).toBe('suppressed');
    expect(third.reason).toBe('frequency_limit');
  });

  it('counts delivered rows only within the current UTC day', async () => {
    const store = new InMemoryStore();
    // Yesterday's deliveries do not count against today's budget.
    store.ledger.push({
      userId: 'user-1',
      notificationId: null,
      claimableId: null,
      notificationType: 'new_match',
      channel: 'email',
      dedupKey: 'yesterday',
      status: 'delivered',
      createdAt: new Date(Date.now() - 2 * 86400000),
    });

    const result = await deliverNotification(
      makeNotification({ dedupKey: 'today' }),
      store,
      {},
      { config: devConfig, frequencyLimits: { new_match: 1 } },
    );
    expect(result.status).toBe('delivered');
  });
});

describe('deliverNotification — preferences and channels', () => {
  it('honours per-channel opt-outs', async () => {
    const store = new InMemoryStore();
    store.preferences = { ...store.preferences, emailEnabled: false, browserEnabled: false };
    const result = await deliverNotification(makeNotification(), store, {}, { config: devConfig });
    expect(result.status).toBe('suppressed');
    expect(result.channels).toHaveLength(0);
  });

  it('skips the email channel when no recipient address exists', async () => {
    const store = new InMemoryStore();
    store.emailByUser.delete('user-1');
    const result = await deliverNotification(makeNotification(), store, {}, { config: devConfig });
    expect(result.status).toBe('delivered'); // browser channel still delivered
    const email = result.channels.find((channel) => channel.channel === 'email');
    expect(email?.status).toBe('skipped');
    expect(email?.reason).toBe('recipient_email_missing');
  });

  it('keeps WhatsApp dormant — interface only, never sent', async () => {
    const store = new InMemoryStore();
    store.preferences = { ...store.preferences, whatsappEnabled: true };
    const result = await deliverNotification(makeNotification(), store, {}, { config: devConfig });
    const whatsapp = result.channels.find((channel) => channel.channel === 'whatsapp');
    expect(whatsapp?.status).toBe('skipped');
    expect(whatsapp?.reason).toBe('not_implemented');
  });
});

describe('deliverNotification — email environment gating', () => {
  it('staging with a Resend key still uses the console provider', () => {
    const provider = selectEmailProvider({
      appEnv: 'staging',
      emailProvider: 'resend',
      resendApiKey: 're_123',
      emailFrom: 'notifications@claimradar.in',
      siteUrl: null,
      unsubscribeSecret: null,
    });
    expect(provider.name).toBe('console-email');
    expect(provider.sendsExternally).toBe(false);
  });

  it('selects Resend only in production with a key', () => {
    const provider = selectEmailProvider({
      appEnv: 'production',
      emailProvider: 'resend',
      resendApiKey: 're_123',
      emailFrom: 'notifications@claimradar.in',
      siteUrl: null,
      unsubscribeSecret: null,
    });
    expect(provider.name).toBe('resend-email');
  });

  it('downgrades a misconfigured external provider outside production', async () => {
    const store = new InMemoryStore();
    store.preferences = { ...store.preferences, browserEnabled: false };

    const sent: RenderedMessage[] = [];
    const rogueExternal = {
      name: 'rogue-external',
      channel: 'email' as const,
      sendsExternally: true,
      async send(message: RenderedMessage): Promise<ProviderSendResult> {
        sent.push(message);
        return { ok: true };
      },
    };

    const result = await deliverNotification(
      makeNotification(),
      store,
      { appEnv: 'staging' },
      { config: { ...devConfig, appEnv: 'staging' }, emailProvider: rogueExternal },
    );

    // The rogue provider must never be called outside production.
    expect(sent).toHaveLength(0);
    const email = result.channels.find((channel) => channel.channel === 'email');
    expect(email?.status).toBe('delivered');
    expect(email?.provider).toBe('console-email');
  });
});

describe('deliverNotification — failure handling and retries', () => {
  it('records failed sends and keeps the trigger retryable', async () => {
    const store = new InMemoryStore();
    store.preferences = { ...store.preferences, browserEnabled: false };

    const failing = {
      name: 'failing-email',
      channel: 'email' as const,
      sendsExternally: false,
      async send(): Promise<ProviderSendResult> {
        return { ok: false, error: 'provider_down' };
      },
    };

    const first = await deliverNotification(
      makeNotification(),
      store,
      {},
      { config: devConfig, emailProvider: failing },
    );
    expect(first.status).toBe('suppressed');
    expect(store.ledger.some((row) => row.status === 'failed')).toBe(true);

    // Retry with a healthy provider succeeds because failed rows do not dedup.
    const healthy = {
      name: 'healthy-email',
      channel: 'email' as const,
      sendsExternally: false,
      async send(): Promise<ProviderSendResult> {
        return { ok: true };
      },
    };
    const second = await deliverNotification(
      makeNotification(),
      store,
      {},
      { config: devConfig, emailProvider: healthy },
    );
    expect(second.status).toBe('delivered');
  });
});
