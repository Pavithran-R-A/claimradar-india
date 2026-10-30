import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ client: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({ getSupabaseServerClient: mocks.client }));
import { getPublishedCompanies, getPublishedSectors } from '../../lib/user-data';
function clientReturning(result: { data: unknown; error: unknown }) {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    then: (resolve: (value: unknown) => void) => resolve(result),
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.order.mockReturnValue(query);
  query.limit.mockReturnValue(query);
  return { from: vi.fn(() => query) };
}
beforeEach(() => vi.resetAllMocks());
describe.each([
  ['companies', getPublishedCompanies, { id: '1', display_name: 'Example', slug: 'example' }],
  ['sectors', getPublishedSectors, { id: '1', name: 'Example', slug: 'example' }],
] as const)('%s directory loader', (_name, load, row) => {
  it('distinguishes a successful empty query', async () => {
    mocks.client.mockResolvedValue(clientReturning({ data: [], error: null }));
    expect(await load()).toEqual({ items: [], unavailable: false });
  });
  it('returns entries after a successful query', async () => {
    mocks.client.mockResolvedValue(clientReturning({ data: [row], error: null }));
    expect(await load()).toEqual({
      items: [{ id: '1', name: 'Example', slug: 'example' }],
      unavailable: false,
    });
  });
  it('reports database errors', async () => {
    mocks.client.mockResolvedValue(clientReturning({ data: null, error: { message: 'failed' } }));
    expect(await load()).toEqual({ items: [], unavailable: true });
  });
  it('reports client failures', async () => {
    mocks.client.mockRejectedValue(new Error('failed'));
    expect(await load()).toEqual({ items: [], unavailable: true });
  });
});
