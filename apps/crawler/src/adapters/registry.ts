import type { SourceDefinition } from '@claimradar/source-registry';
import type { SourceAdapter } from './types.js';
import { BaseRssAdapter } from './rss/base.js';
import { PibRssAdapter } from './rss/pib.js';
import { SebiRssAdapter } from './rss/sebi.js';
import { RbiRssAdapter } from './rss/rbi.js';
import { GenericRssAdapter } from './rss/generic.js';
import { HtmlListingAdapter } from './html/listing.js';
import { HtmlDetailAdapter } from './html/detail.js';
import { PdfIndexAdapter } from './pdf/index.js';

export function getAdapter(source: SourceDefinition): SourceAdapter {
  switch (source.adapterType) {
    case 'rss':
      return new BaseRssAdapter(source);
    case 'rss-pib':
      return new PibRssAdapter(source);
    case 'rss-sebi':
      return new SebiRssAdapter(source);
    case 'rss-rbi':
      return new RbiRssAdapter(source);
    case 'rss-generic':
      return new GenericRssAdapter(source);
    case 'html_listing':
      return new HtmlListingAdapter(source);
    case 'html_detail':
      return new HtmlDetailAdapter(source);
    case 'pdf_index':
      return new PdfIndexAdapter(source);
    default:
      throw new Error(`Unknown adapter type: ${source.adapterType}`);
  }
}
