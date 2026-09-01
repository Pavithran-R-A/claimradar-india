import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Motion Design System & Accessibility Coverage', () => {
  const cssPath = path.resolve(__dirname, '../app/globals.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  it('defines the required motion token system in globals.css', () => {
    expect(cssContent).toContain('--motion-instant: 100ms;');
    expect(cssContent).toContain('--motion-fast: 140ms;');
    expect(cssContent).toContain('--motion-ui: 180ms;');
    expect(cssContent).toContain('--motion-panel: 260ms;');
    expect(cssContent).toContain('--motion-enter: 380ms;');
    expect(cssContent).toContain('--motion-editorial: 520ms;');

    expect(cssContent).toContain('--ease-standard: cubic-bezier(0.2, 0.8, 0.2, 1);');
    expect(cssContent).toContain('--ease-out: cubic-bezier(0.16, 1, 0.3, 1);');
    expect(cssContent).toContain('--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);');
  });

  it('includes strict prefers-reduced-motion overrides in globals.css', () => {
    expect(cssContent).toContain('@media (prefers-reduced-motion: reduce)');
    expect(cssContent).toContain('animation-duration: 0.01ms !important;');
    expect(cssContent).toContain('transition-duration: 0.01ms !important;');
    expect(cssContent).toContain('.animate-radar-sweep');
    expect(cssContent).toContain('animation: none !important;');
  });

  it('verifies that no third-party heavy animation libraries (framer-motion, gsap) are imported in source code', () => {
    function scanSource(dir: string): number {
      let count = 0;
      for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, f.name);
        if (f.isDirectory() && !f.name.startsWith('.') && f.name !== 'node_modules') {
          count += scanSource(full);
        } else if (f.name.endsWith('.tsx') || f.name.endsWith('.ts')) {
          const content = fs.readFileSync(full, 'utf-8');
          if (content.includes('framer-motion') || content.includes('gsap')) {
            count++;
          }
        }
      }
      return count;
    }
    const appImports = scanSource(path.resolve(__dirname, '../app'));
    const compImports = scanSource(path.resolve(__dirname, '../components'));
    expect(appImports).toBe(0);
    expect(compImports).toBe(0);
  });

  it('verifies 0 nested interactive elements (<Link><Button> or <a><button>) exist in apps/web', () => {
    function scanNested(dir: string): number {
      let count = 0;
      for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, f.name);
        if (f.isDirectory() && !f.name.startsWith('.') && f.name !== 'node_modules') {
          count += scanNested(full);
        } else if (f.name.endsWith('.tsx') || f.name.endsWith('.ts')) {
          const content = fs.readFileSync(full, 'utf-8');
          const linkRegex = /<(Link|a)\b[^>]*>([\s\S]*?)<\/\1>/gi;
          let match;
          while ((match = linkRegex.exec(content)) !== null) {
            const inner: string = match[2] ?? '';
            if (/<(Button|button)\b/i.test(inner)) {
              count++;
            }
          }
        }
      }
      return count;
    }

    const totalNested = scanNested(path.resolve(__dirname, '..'));
    expect(totalNested).toBe(0);
  });

  it('verifies Reveal primitive checks for prefers-reduced-motion', () => {
    const revealPath = path.resolve(__dirname, '../components/motion/reveal.tsx');
    const revealContent = fs.readFileSync(revealPath, 'utf8');
    expect(revealContent).toContain("matchMedia('(prefers-reduced-motion: reduce)')");
    expect(revealContent).toContain('IntersectionObserver');
    expect(revealContent).toContain('motion-reduce:!opacity-100');
  });
});
