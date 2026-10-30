import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
vi.stubGlobal('React', React);

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  watchlist: vi.fn(),
  companies: vi.fn(),
  sectors: vi.fn(),
}));
vi.mock('@/lib/app-auth', () => ({ requireAppAuth: mocks.auth }));
vi.mock('@/lib/user-data', () => ({
  getWatchlist: mocks.watchlist,
  getPublishedCompanies: mocks.companies,
  getPublishedSectors: mocks.sectors,
}));
vi.mock('../../app/app/actions', () => ({ unwatchCompany: vi.fn(), unwatchSector: vi.fn() }));
vi.mock('../../app/app/watchlist/watchlist-client', () => ({
  WatchlistClient: () => 'Watchlist picker',
}));
import WatchlistPage from '../../app/app/watchlist/page';

const outcome = (items: unknown[], unavailable = false) => ({ items, unavailable });
beforeEach(() => {
  vi.resetAllMocks();
  mocks.auth.mockResolvedValue({ id: 'test-user' });
  mocks.watchlist.mockResolvedValue({ companies: [], sectors: [], unavailable: false });
  mocks.companies.mockResolvedValue(outcome([]));
  mocks.sectors.mockResolvedValue(outcome([]));
});
describe('watchlist directory', () => {
  it('explains a successfully loaded empty directory without reporting an outage', async () => {
    const html = renderToStaticMarkup(await WatchlistPage());
    expect(html).toContain('No companies or sectors available yet');
    expect(html).not.toContain('Directory unavailable');
  });
  it('offers the picker when the directory has entries', async () => {
    mocks.companies.mockResolvedValue(outcome([{ id: '1', name: 'Example', slug: 'example' }]));
    expect(renderToStaticMarkup(await WatchlistPage())).toContain('Watchlist picker');
  });
  it('reports a directory query error even when the other query returns entries', async () => {
    mocks.companies.mockResolvedValue(outcome([], true));
    mocks.sectors.mockResolvedValue(outcome([{ id: '1', name: 'Example', slug: 'example' }]));
    expect(renderToStaticMarkup(await WatchlistPage())).toContain('Directory unavailable');
  });
  it('does not call a watchlist failure a directory failure', async () => {
    mocks.watchlist.mockResolvedValue({ companies: [], sectors: [], unavailable: true });
    const html = renderToStaticMarkup(await WatchlistPage());
    expect(html).toContain('Watchlist temporarily unavailable');
    expect(html).not.toContain('Directory unavailable');
  });
  it('requires authentication before loading directory data', async () => {
    mocks.auth.mockRejectedValue(new Error('unauthorized'));
    await expect(WatchlistPage()).rejects.toThrow('unauthorized');
    expect(mocks.companies).not.toHaveBeenCalled();
  });
});
