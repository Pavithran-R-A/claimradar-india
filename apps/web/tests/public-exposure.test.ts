import { describe, it, expect } from 'vitest';
import { getPublishedClaimables, getPublishedClaimableBySlug } from '../lib/claimables-repository';

describe('Public Data Exposure Security Tests', () => {
  it('should only return published records in directory queries', async () => {
    const res = await getPublishedClaimables();
    expect(res.items.length).toBeGreaterThan(0);
    for (const item of res.items) {
      expect(['open', 'closing_soon', 'closed']).toContain(item.status);
      expect(item).not.toHaveProperty('rawText');
      expect(item).not.toHaveProperty('aiPrompt');
      expect(item).not.toHaveProperty('staffNotes');
      expect(item).not.toHaveProperty('auditLog');
    }
  });

  it('should not leak non-existent or internal draft slugs', async () => {
    const result = await getPublishedClaimableBySlug('internal-draft-candidate-999');
    expect(result).toBeNull();
  });
});
