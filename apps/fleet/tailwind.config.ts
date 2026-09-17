import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Marketing-layer tokens — resolve to the OKLCH custom properties in index.css
        paper: 'var(--color-paper)',
        clay: 'var(--color-clay)',
        ink: {
          DEFAULT: 'var(--color-ink)',
          soft: 'var(--color-ink-2)',
        },
        subtle: 'var(--color-muted)',
        rule: 'var(--color-rule)',
        accent: {
          DEFAULT: 'var(--color-accent)',
          soft: 'var(--color-accent-soft)',
          ink: 'var(--color-accent-ink)',
        },
        neu: {
          bg: '#e8ecf3',
          raised: '#eef1f7',
          sunken: '#dde2ec',
          text: '#1f2a3d',
          muted: '#57627a',
        },
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // Lieferuhr blue — the umbrella product referenced from this app
        uhr: {
          600: '#364fc7',
          700: '#2f44ad',
        },
        risk: {
          green: '#2f9e44',
          yellow: '#f08c00',
          red: '#e03131',
        },
      },
      boxShadow: {
        neu: '7px 7px 16px #c3cbdb, -7px -7px 16px #ffffff',
        'neu-sm': '3px 3px 8px #c3cbdb, -3px -3px 8px #ffffff',
        'neu-inset': 'inset 3px 3px 7px #c3cbdb, inset -3px -3px 7px #ffffff',
        'neu-inset-sm': 'inset 2px 2px 4px #c3cbdb, inset -2px -2px 4px #ffffff',
      },
      fontFamily: {
        sans: ['"Geist Variable"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk Variable"', '"Geist Variable"', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
