import { DEFAULT_INDEXNOW_KEY } from '@/lib/indexnow';

export const dynamic = 'force-dynamic';

export function GET() {
  const key = process.env.INDEXNOW_KEY || DEFAULT_INDEXNOW_KEY;
  return new Response(key, {
    status: 200,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}
