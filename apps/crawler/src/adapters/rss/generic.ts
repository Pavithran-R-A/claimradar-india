import type { SourceDefinition } from '@claimradar/source-registry';
import { BaseRssAdapter } from './base.js';

/**
 * Generic RSS adapter for standard RSS 2.0 / Atom feeds.
 * Used for any source that provides a well-formed RSS feed URL.
 */
export class GenericRssAdapter extends BaseRssAdapter {
  constructor(source: SourceDefinition) {
    super(source);
  }
}
