import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Compiled Production CSS Motion Verification', () => {
  const cssDir = path.resolve(__dirname, '../.next/static/css');

  function getCompiledCss(): string {
    if (!fs.existsSync(cssDir)) {
      return '';
    }
    const files = fs.readdirSync(cssDir).filter((f) => f.endsWith('.css'));
    return files.map((f) => fs.readFileSync(path.join(cssDir, f), 'utf8')).join('\n');
  }

  it('ensures production build contains compiled CSS bundle', () => {
    const compiledCss = getCompiledCss();
    expect(compiledCss.length).toBeGreaterThan(0);
  });

  it('verifies custom motion animation classes exist in compiled CSS', () => {
    const css = getCompiledCss();
    expect(css).toContain('.nav-link-indicator');
    expect(css).toContain('.animate-route-entry');
    expect(css).toContain('.animate-radar-sweep');
    expect(css).toContain('.animate-detection-blip');
    expect(css).toContain('.animate-draw-line');
    expect(css).toContain('.drawer-backdrop-enter');
    expect(css).toContain('.drawer-panel-enter');
    expect(css).toContain('.drawer-link-enter');
    expect(css).toContain('.search-clear-enter');
  });

  it('verifies semantic duration tokens and utility classes are generated from tailwind content scanning and globals.css', () => {
    const css = getCompiledCss();
    expect(css).toMatch(/duration-fast|--motion-fast:s*140ms/);
    expect(css).toMatch(/duration-ui|--motion-ui:s*180ms/);
    expect(css).toMatch(/--motion-panel:s*260ms/);
    expect(css).toMatch(/duration-enter|--motion-enter:s*380ms/);
  });

  it('verifies shadow-xs and backdrop-blur-xs utilities are compiled into CSS', () => {
    const css = getCompiledCss();
    expect(css).toMatch(/shadow-xs|0 1px 2px 0/);
    expect(css).toMatch(/backdrop-blur-xs|backdrop-filter:s*blur(2px)/);
  });

  it('verifies prefers-reduced-motion media query exists with animation cancellation', () => {
    const css = getCompiledCss();
    expect(css).toContain('prefers-reduced-motion:reduce');
    expect(css).toContain('animation:none');
  });

  it('regression protection: verifies component utilities from apps/web/components are scanned by Tailwind', () => {
    const tailwindConfigPath = path.resolve(__dirname, '../tailwind.config.ts');
    const tailwindConfig = fs.readFileSync(tailwindConfigPath, 'utf8');
    expect(tailwindConfig).toContain('./components/**/*.{js,ts,jsx,tsx,mdx}');
  });
});
