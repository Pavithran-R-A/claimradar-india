import { describe, it, expect } from 'vitest';
import { sha256 } from '../../src/http/hash.js';

describe('SHA-256 Hashing', () => {
  it('should produce consistent hashes for same content', () => {
    const content = 'Hello, World!';
    const hash1 = sha256(content);
    const hash2 = sha256(content);
    expect(hash1).toBe(hash2);
  });

  it('should produce different hashes for different content', () => {
    const hash1 = sha256('Content A');
    const hash2 = sha256('Content B');
    expect(hash1).not.toBe(hash2);
  });

  it('should handle Buffer input', () => {
    const buffer = Buffer.from('Test content');
    const hash = sha256(buffer);
    expect(hash).toBeTypeOf('string');
    expect(hash).toHaveLength(64); // SHA-256 produces 64-char hex
  });

  it('should produce 64-character hex string', () => {
    const hash = sha256('test');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('should handle empty string', () => {
    const hash = sha256('');
    expect(hash).toBeTypeOf('string');
    expect(hash).toHaveLength(64);
  });

  it('should handle same content as string and buffer', () => {
    const content = 'identical content';
    const hashFromString = sha256(content);
    const hashFromBuffer = sha256(Buffer.from(content));
    expect(hashFromString).toBe(hashFromBuffer);
  });
});
