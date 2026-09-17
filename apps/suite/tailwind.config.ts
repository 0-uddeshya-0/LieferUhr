import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: 'var(--color-paper)',
          2: 'var(--color-paper-2)',
        },
        clay: 'var(--color-clay)',
        ink: {
          DEFAULT: 'var(--color-ink)',
          soft: 'var(--color-ink-2)',
        },
        subtle: 'var(--color-muted)',
        rule: 'var(--color-rule)',
        // Umbrella brand — Lieferuhr blue
        uhr: {
          DEFAULT: 'var(--color-uhr)',
          soft: 'var(--color-uhr-soft)',
          ink: 'var(--color-uhr-ink)',
        },
        // Product accents — each tool carries its own hue across the suite
        dispatch: {
          DEFAULT: 'var(--color-dispatch)',
          soft: 'var(--color-dispatch-soft)',
          ink: 'var(--color-dispatch-ink)',
        },
        comply: {
          DEFAULT: 'var(--color-comply)',
          soft: 'var(--color-comply-soft)',
          ink: 'var(--color-comply-ink)',
        },
        hvac: {
          DEFAULT: 'var(--color-hvac)',
          soft: 'var(--color-hvac-soft)',
          ink: 'var(--color-hvac-ink)',
        },
        depot: {
          DEFAULT: 'var(--color-depot)',
          soft: 'var(--color-depot-soft)',
          ink: 'var(--color-depot-ink)',
        },
        // FrachtRadar amber — cross-product handoff element only
        fracht: {
          DEFAULT: 'var(--color-fracht)',
          ink: 'var(--color-fracht-ink)',
        },
        sev: {
          warn: '#c77700',
          bad: '#c92a2a',
        },
        neu: {
          base: '#e8ecf3',
          bg: '#e8ecf3',
          raised: '#eef1f7',
          sunken: '#dde2ec',
          inset: '#dde2ec',
          text: '#1f2a3d',
          muted: '#57627a',
        },
        risk: {
          green: '#2f9e44',
          yellow: '#f08c00',
          red: '#e03131',
        },
      },
      boxShadow: {
        neu: '7px 7px 16px #c3cbdb, -7px -7px 16px #ffffff',
        'neu-lg': '10px 10px 24px #bcc5d6, -10px -10px 24px #ffffff',
        'neu-sm': '3px 3px 8px #c3cbdb, -3px -3px 8px #ffffff',
        'neu-in': 'inset 3px 3px 7px #c3cbdb, inset -3px -3px 7px #ffffff',
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
