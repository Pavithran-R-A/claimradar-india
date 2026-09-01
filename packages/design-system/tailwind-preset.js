/**
 * Shared Tailwind token preset for the ClaimRadar design system.
 *
 * Editorial Public-Benefit Finance token scheme:
 * - Canvas: #F7F6F2
 * - Surface: #FFFFFF
 * - Primary Ink: #15171A
 * - Secondary Text: #525A65
 * - Muted Text: #707782
 * - Border / Rule: #D9DAD6
 * - Primary Action: #214E80 (Deep Editorial Blue)
 * - Primary Action Hover: #173B62
 * - Verified: #23705A
 * - Deadline: #B45F06
 * - Danger: #B42318
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
        paper: {
          canvas: '#F7F6F2',
          surface: '#FFFFFF',
          strong: '#F0EFEA',
          border: '#D9DAD6',
        },
        editorial: {
          blue: '#214E80',
          'blue-dark': '#173B62',
          ink: '#15171A',
          secondary: '#525A65',
          muted: '#707782',
          verified: '#23705A',
          deadline: '#B45F06',
          danger: '#B42318',
          dark: '#171C23',
        },
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      transitionDuration: {
        instant: '100ms',
        fast: '140ms',
        ui: '180ms',
        panel: '260ms',
        enter: '380ms',
        editorial: '520ms',
      },
    },
  },
};
