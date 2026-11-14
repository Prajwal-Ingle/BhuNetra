/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Fira Code"', 'Consolas', 'monospace'],
      },
      colors: {
        canvas: {
          DEFAULT: '#edece8',
          subtle: '#e5e3de',
          dark: '#101322',
        },
        card: {
          DEFAULT: '#ffffff',
          warm: '#faf9f6',
          blush: '#fdece8',
          border: '#e2dfd7',
          'border-light': '#eeebe3',
        },
        txt: {
          primary: '#111827',
          secondary: '#6b7280',
          muted: '#9ca3af',
          light: '#ffffff',
        },
        coral: {
          DEFAULT: '#ff6f61',
          rose: '#f04f78',
          dark: '#d93d65',
          blush: '#fdece8',
          track: '#fee5df',
        },
        navy: {
          DEFAULT: '#101322',
          dark: '#0c0e1a',
          light: '#1e233d',
          hover: '#191d33',
        },
        dark: {
          bg: '#edece8',
          surface: '#ffffff',
          card: '#ffffff',
          hover: '#f5f4f0',
          border: '#e2dfd7',
          'border-light': '#eeebe3',
        },
        earth: {
          950: '#101322',
          900: '#edece8',
          850: '#ffffff',
          800: '#ffffff',
          750: '#f5f4f0',
          700: '#e2dfd7',
          border: '#e2dfd7',
        },
        agri: {
          300: '#86efac',
          400: '#4ade80',
          500: '#10b981',
          600: '#059669',
        },
        hydro: {
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#06b6d4',
          600: '#0284c7',
        },
        brand: {
          iris: '#f04f78',
          'iris-glow': '#ff6f61',
          'iris-dark': '#d93d65',
          purple: '#101322',
          'purple-glow': '#1e233d',
          'purple-dark': '#0c0e1a',
          coral: '#ff6f61',
          rose: '#f04f78',
          navy: '#101322',
          green: '#10b981',
          emerald: '#10b981',
          amber: '#f59e0b',
          cyan: '#06b6d4',
          red: '#ef4444'
        }
      },
      boxShadow: {
        'card': '0 2px 14px -2px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 8px 24px -4px rgba(0, 0, 0, 0.08)',
        'btn-navy': '0 4px 14px -1px rgba(16, 19, 34, 0.25)',
        'btn-coral': '0 4px 14px -1px rgba(240, 79, 120, 0.35)',
        'btn-iris': '0 4px 14px -1px rgba(16, 19, 34, 0.25)',
        'glow-purple': '0 4px 14px -2px rgba(16, 19, 34, 0.15)',
        'glow-green': '0 4px 14px -2px rgba(16, 185, 129, 0.2)',
      }
    },
  },
  plugins: [],
}
