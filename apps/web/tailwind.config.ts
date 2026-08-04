import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', '../../packages/design-system/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#070B14',
        'background-elevated': '#0B1120',
        surface: '#101827',
        'surface-strong': '#151F32',
        border: 'rgba(255,255,255,0.09)',
        'text-primary': '#F7F8FB',
        'text-secondary': '#A7B0C0',
        'text-muted': '#778197',
        'trust-primary': '#7387FF',
        'trust-primary-hover': '#8798FF',
        success: '#28C6A2',
        deadline: '#F4A340',
        danger: '#FF6B72',
        info: '#5DB7FF',
        'verified-background': 'rgba(40,198,162,0.12)',
        'deadline-background': 'rgba(244,163,64,0.12)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'sans-serif'],
        serif: ['var(--font-newsreader)', 'serif'],
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
      },
      keyframes: {
        shimmer: {
          '0%': { opacity: '0.5' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
