import { describe, it, expect, vi, afterEach } from 'vitest';
import { LogAlertSink, createAlertSink, alertDedupKey } from '../../src/observability/alerts.js';
import type { AlertEvent } from '../../src/observability/alerts.js';

function alert(overrides: Partial<AlertEvent> = {}): AlertEvent {
  return {
    alertType: 'source-health-failure',
    severity: 'warning',
    message: 'test alert',
    ...overrides,
  };
}

describe('Alert sinks', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.ALERT_SINK;
    delete process.env.ALERT_DEDUP_WINDOW_MINUTES;
  });

  it('emits structured alert lines on stderr via the log sink', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const sink = new LogAlertSink(60_000, () => 1000);
    sink.emit(alert({ sourceId: 'pib-rss', category: 'TIMEOUT' }));

    expect(spy).toHaveBeenCalledTimes(1);
    const line = JSON.parse(spy.mock.calls[0]![0] as string);
    expect(line.type).toBe('alert');
    expect(line.alertType).toBe('source-health-failure');
    expect(line.category).toBe('TIMEOUT');
    expect(line.sourceId).toBe('pib-rss');
  });

  it('deduplicates repeated alerts with the same key inside the window', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    let clock = 0;
    const sink = new LogAlertSink(60 * 60_000, () => clock);

    sink.emit(alert({ sourceId: 'pib-rss', category: 'TIMEOUT' }));
    sink.emit(alert({ sourceId: 'pib-rss', category: 'TIMEOUT' })); // duplicate
    sink.emit(alert({ sourceId: 'pib-rss', category: 'TIMEOUT' })); // duplicate

    expect(spy).toHaveBeenCalledTimes(1);
    expect(sink.suppressedCount).toBe(2);

    // After the window expires, the same alert fires again
    clock += 61 * 60_000;
    sink.emit(alert({ sourceId: 'pib-rss', category: 'TIMEOUT' }));
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('keeps distinct dedup keys separate (different source or category)', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const sink = new LogAlertSink(60 * 60_000, () => 0);

    sink.emit(alert({ sourceId: 'pib-rss', category: 'TIMEOUT' }));
    sink.emit(alert({ sourceId: 'sebi-rss', category: 'TIMEOUT' }));
    sink.emit(alert({ sourceId: 'pib-rss', category: 'DNS_ERROR' }));
    sink.emit(alert({ alertType: 'database-failure' }));

    expect(spy).toHaveBeenCalledTimes(4);
    expect(sink.suppressedCount).toBe(0);
  });

  it('builds dedup keys from type, source, and category only', () => {
    expect(alertDedupKey(alert({ sourceId: 'a', category: 'TIMEOUT', message: 'one' }))).toBe(
      alertDedupKey(alert({ sourceId: 'a', category: 'TIMEOUT', message: 'two' })),
    );
    expect(alertDedupKey(alert({ sourceId: 'a' }))).not.toBe(
      alertDedupKey(alert({ sourceId: 'b' })),
    );
  });

  it('honours ALERT_SINK=none via createAlertSink', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    process.env.ALERT_SINK = 'none';
    const sink = createAlertSink();
    sink.emit(alert());
    expect(spy).not.toHaveBeenCalled();
  });

  it('reads the dedup window from ALERT_DEDUP_WINDOW_MINUTES', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    process.env.ALERT_DEDUP_WINDOW_MINUTES = '5';
    let clock = 0;
    vi.spyOn(Date, 'now').mockImplementation(() => clock);
    const sink = createAlertSink();
    sink.emit(alert());
    clock += 4 * 60_000;
    sink.emit(alert()); // suppressed
    clock += 2 * 60_000;
    sink.emit(alert()); // outside the 5-minute window
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
