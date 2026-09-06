import { describe, it, expect } from 'vitest';
import { validateUrl, isPrivateIp } from '../../src/http/ssrf.js';

describe('SSRF Protection', () => {
  describe('validateUrl', () => {
    it('should block loopback address 127.0.0.1', () => {
      const result = validateUrl('http://127.0.0.1/admin');
      expect(result.safe).toBe(false);
      expect(result.reason).toContain('Private IP blocked');
    });

    it('should block private IP 10.0.0.1', () => {
      const result = validateUrl('https://10.0.0.1/internal');
      expect(result.safe).toBe(false);
      expect(result.reason).toContain('Private IP blocked');
    });

    it('should block private IP 192.168.1.1', () => {
      const result = validateUrl('http://192.168.1.1/config');
      expect(result.safe).toBe(false);
      expect(result.reason).toContain('Private IP blocked');
    });

    it('should block private IP 172.16.0.1', () => {
      const result = validateUrl('https://172.16.0.1/api');
      expect(result.safe).toBe(false);
      expect(result.reason).toContain('Private IP blocked');
    });

    it('should block bracketed IPv6 loopback ::1', () => {
      const result = validateUrl('http://[::1]/admin');
      expect(result.safe).toBe(false);
      expect(result.reason).toContain('Private IP blocked');
    });

    it('should identify IPv6 loopback directly', () => {
      expect(isPrivateIp('::1')).toBe(true);
    });

    it('should allow public IPs', () => {
      const result = validateUrl('https://8.8.8.8/api');
      expect(result.safe).toBe(true);
    });

    it('should block non-http protocols (ftp)', () => {
      const result = validateUrl('ftp://example.com/file');
      expect(result.safe).toBe(false);
      expect(result.reason).toContain('Disallowed protocol');
    });

    it('should block file protocol', () => {
      const result = validateUrl('file:///etc/passwd');
      expect(result.safe).toBe(false);
      expect(result.reason).toContain('Disallowed protocol');
    });

    it('should block javascript protocol', () => {
      const result = validateUrl('javascript:alert(1)');
      expect(result.safe).toBe(false);
      expect(result.reason).toContain('Disallowed protocol');
    });

    it('should handle invalid URLs', () => {
      const result = validateUrl('not a url');
      expect(result.safe).toBe(false);
      expect(result.reason).toContain('Invalid URL');
    });

    it('should allow valid https URLs', () => {
      const result = validateUrl('https://pib.gov.in/news');
      expect(result.safe).toBe(true);
    });

    it('should allow valid http URLs', () => {
      const result = validateUrl('http://sebi.gov.in/orders');
      expect(result.safe).toBe(true);
    });
  });

  describe('isPrivateIp', () => {
    it('should identify 127.0.0.1 as private', () => {
      expect(isPrivateIp('127.0.0.1')).toBe(true);
    });

    it('should identify 10.255.255.255 as private', () => {
      expect(isPrivateIp('10.255.255.255')).toBe(true);
    });

    it('should identify 172.16.0.0 as private', () => {
      expect(isPrivateIp('172.16.0.0')).toBe(true);
    });

    it('should identify 172.31.255.255 as private', () => {
      expect(isPrivateIp('172.31.255.255')).toBe(true);
    });

    it('should identify 192.168.0.1 as private', () => {
      expect(isPrivateIp('192.168.0.1')).toBe(true);
    });

    it('should identify 169.254.1.1 as private (link-local)', () => {
      expect(isPrivateIp('169.254.1.1')).toBe(true);
    });

    it('should identify 8.8.8.8 as public', () => {
      expect(isPrivateIp('8.8.8.8')).toBe(false);
    });

    it('should identify ::1 as private (IPv6 loopback)', () => {
      expect(isPrivateIp('::1')).toBe(true);
    });

    it('should identify 2001:db8::1 as public (IPv6)', () => {
      expect(isPrivateIp('2001:db8::1')).toBe(false);
    });
  });
});
