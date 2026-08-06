import { describe, expect, it } from 'vitest';
import { shortId, slugify, statusVariant, trustVariant } from '@/app/admin/_lib/ui';

/**
 * Presentation helpers shared by every admin table and detail page. Status
 * colour mapping and slugs are deterministic; these tests pin the mapping
 * so a rename cannot silently break badge semantics across the panel.
 */

describe('statusVariant', () => {
  it('maps pipeline progress states to info', () => {
    expect(statusVariant('pending')).toBe('info');
    expect(statusVariant('running')).toBe('info');
    expect(statusVariant('under_review')).toBe('info');
    expect(statusVariant('new')).toBe('info');
  });

  it('maps positive terminal states to success', () => {
    expect(statusVariant('completed')).toBe('success');
    expect(statusVariant('approved')).toBe('success');
    expect(statusVariant('published')).toBe('success');
    expect(statusVariant('clear_to_publish')).toBe('success');
  });

  it('maps failure and risk states to danger', () => {
    expect(statusVariant('failed')).toBe('danger');
    expect(statusVariant('rejected')).toBe('danger');
    expect(statusVariant('legal_risk')).toBe('danger');
    expect(statusVariant('granted')).toBe('danger');
  });

  it('maps holding states to warning and unknowns to neutral', () => {
    expect(statusVariant('deferred')).toBe('warning');
    expect(statusVariant('needs_changes')).toBe('warning');
    expect(statusVariant('something_else')).toBe('neutral');
  });
});

describe('trustVariant', () => {
  it('orders source trust levels deterministically', () => {
    expect(trustVariant('official')).toBe('success');
    expect(trustVariant('reputable')).toBe('info');
    expect(trustVariant('community')).toBe('warning');
    expect(trustVariant('unknown')).toBe('neutral');
  });
});

describe('slugify', () => {
  it('produces URL-safe slugs from arbitrary titles', () => {
    expect(slugify('SEBI Order 2026 — Refund!')).toBe('sebi-order-2026-refund');
    expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces');
  });

  it('strips diacritics and falls back for empty input', () => {
    expect(slugify('Café Résumé')).toBe('cafe-resume');
    expect(slugify('!!!')).toBe('untitled');
  });

  it('caps slug length at 80 characters', () => {
    expect(slugify('a'.repeat(200)).length).toBeLessThanOrEqual(80);
  });
});

describe('shortId', () => {
  it('truncates uuids and leaves short ids untouched', () => {
    expect(shortId('12345678-90ab')).toBe('12345678…');
    expect(shortId('abc')).toBe('abc');
  });
});
