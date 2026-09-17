import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        neu: {
          bg: '#e8ecf3',
          raised: '#eef1f7',
          sunken: '#dde2ec',
          text: '#1f2a3d',
          muted: '#57627a',
        },
        brand: {
          50: '#f0f4ff',
          100: '#dde7ff',
          200: '#bac8ff',
          300: '#91a7ff',
          400: '#5c7cfa',
          500: '#3b5bdb',
          600: '#364fc7',
          700: '#2f44ad',
          800: '#243a96',
          900: '#1a2b70',
        },
        // FrachtRadar accent — sibling product shown on the umbrella page
        fracht: {
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
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
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit Variable', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
