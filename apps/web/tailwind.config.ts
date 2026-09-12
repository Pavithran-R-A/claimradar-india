import type { Config } from 'tailwindcss';

/**
 * ClaimRadar design tokens.
 *
 * Token architecture (documented in docs/design/design-system.md):
 * - Semantic colour tokens are defined as CSS custom properties in
 *   `app/globals.css`. The `:root` block carries the light-first theme, and
 *   the `.theme-dark` block overrides variables for dark surfaces.
 * - Colours that must support Tailwind opacity modifiers use the
 *   `rgb(var(--c-*) / <alpha-value>)` form.
 */
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/design-system/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* --- Semantic (theme-switchable) tokens ------------------------- */
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

        /* --- Deep-ink material scale (hero, footer — always dark) ------- */
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
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['var(--font-newsreader)', 'ui-serif', 'Georgia', 'serif'],
      },
      maxWidth: {
        content: '76rem',
      },
      borderRadius: {
        card: '0.75rem',
        field: '0.5rem',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.07)',
        lift: '0 10px 28px -12px rgba(15, 23, 42, 0.22)',
        panel: '0 16px 48px -16px rgba(6, 11, 20, 0.35)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        shimmer: 'shimmer 1.6s ease-in-out infinite',
        rise: 'rise 0.55s cubic-bezier(0.2, 0.7, 0.2, 1) both',
        fade: 'fade 0.45s ease-out both',
        aurora: 'aurora 26s ease-in-out infinite alternate',
        'radar-sweep': 'radar-sweep 6s linear infinite',
        'radar-pulse': 'radar-pulse 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'beacon-pulse': 'beacon-pulse 2.5s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { opacity: '0.5' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.5' },
        },
        rise: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        aurora: {
          '0%': { transform: 'translate3d(-4%, -2%, 0) scale(1)' },
          '100%': { transform: 'translate3d(4%, 2%, 0) scale(1.06)' },
        },
        'radar-sweep': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'radar-pulse': {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '70%': { transform: 'scale(1.25)', opacity: '0' },
          '100%': { transform: 'scale(1.25)', opacity: '0' },
        },
        'beacon-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.35)', opacity: '0.4' },
        },
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
        lift: 'cubic-bezier(0, 0, 0.2, 1)',
      },
      transitionDuration: {
        instant: '100ms',
        fast: '140ms',
        ui: '180ms',
        panel: '260ms',
        enter: '380ms',
        editorial: '520ms',
        // Preserve legacy aliases for backwards compatibility
        base: '200ms',
        slow: '350ms',
      },
    },
  },
  plugins: [],
};

export default config;
