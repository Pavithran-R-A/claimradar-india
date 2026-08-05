import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

/**
 * Honest-content policy.
 *
 * No genuine guide articles have been published yet. Rather than generating
 * placeholder or programmatic filler pages, every slug resolves to a 404 and is
 * therefore excluded from the sitemap and from search indexing. This route
 * exists so that links resolve predictably and can serve genuine, written
 * content as soon as it is available.
 */

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function GuideDetailPage() {
  notFound();
  return null;
}
