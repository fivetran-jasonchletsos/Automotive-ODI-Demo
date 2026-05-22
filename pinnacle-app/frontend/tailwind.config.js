/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        graphite: {
          50:  '#f8f8fb',
          100: '#f0f0f4',
          200: '#e0e0e6',
          300: '#c8c8d0',
          400: '#9b9ba4',
          500: '#6b6b74',
          600: '#47474f',
          700: '#2e2e36',
          800: '#1a1a1f',
          900: '#0f0f12',
          950: '#07070a',
        },
        racing: {
          400: '#f87171',
          500: '#f43f3f',
          600: '#dc2626',
          700: '#b91c1c',
        },
        signal: {
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        bull: {
          600: '#15803d',
        },
      },
      fontFamily: {
        sans:      ['Inter', 'ui-sans-serif', 'system-ui'],
        display:   ['Antonio', 'Bebas Neue', 'Impact', 'sans-serif'],
        condensed: ['Barlow Condensed', 'Antonio', 'sans-serif'],
        mono:      ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        readout:   ['Share Tech Mono', 'JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'carbon': `repeating-linear-gradient(45deg, transparent 0, transparent 2px, rgba(255,255,255,0.025) 2px, rgba(255,255,255,0.025) 4px), repeating-linear-gradient(-45deg, transparent 0, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)`,
      },
      boxShadow: {
        'glow-racing': '0 0 12px rgba(220,38,38,0.4)',
        'glow-signal': '0 0 12px rgba(37,99,235,0.4)',
      },
    },
  },
  plugins: [],
};
