/**
 * Shared Tailwind token preset for the ClaimRadar design system.
 *
 * Mirrors the semantic token architecture of apps/web/tailwind.config.ts
 * (documented in docs/design/design-system.md): semantic colours resolve to
 * CSS custom properties so the public site (.theme-light) and the app shell
 * (:root dark) share one component vocabulary. Consumers must define the
 * matching --c-* variables in their global stylesheet.
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--c-background) / <alpha-value>)',
        'background-elevated': 'rgb(var(--c-background-elevated) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        'surface-strong': 'rgb(var(--c-surface-strong) / <alpha-value>)',
        border: 'var(--c-border)',
        'text-primary': 'rgb(var(--c-text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--c-text-secondary) / <alpha-value>)',
        'text-muted': 'rgb(var(--c-text-muted) / <alpha-value>)',
        'trust-primary': 'rgb(var(--c-trust-primary) / <alpha-value>)',
        'trust-primary-hover': 'rgb(var(--c-trust-primary-hover) / <alpha-value>)',
        success: 'rgb(var(--c-success) / <alpha-value>)',
        deadline: 'rgb(var(--c-deadline) / <alpha-value>)',
        danger: 'rgb(var(--c-danger) / <alpha-value>)',
        info: 'rgb(var(--c-info) / <alpha-value>)',
        'verified-background': 'var(--c-verified-background)',
        'deadline-background': 'var(--c-deadline-background)',
        ink: {
          950: '#060B14',
          900: '#0A1322',
          800: '#101D31',
          700: '#1A2A44',
          600: '#27395C',
        },
        'brand-bright': '#2DD4BF',
        'gold-bright': '#F4A340',
      },
    },
  },
};
