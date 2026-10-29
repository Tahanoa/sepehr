/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './index.html',
    './src/**/*.{ts,js,html}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          evergreen: '#012622',
          darkgreen: '#003B36',
          lavender: '#ECE5F0',
          amber: '#E98A15',
          purple: '#59114D',
        },
        polaris: {
          primary: {
            DEFAULT: 'var(--color-primary)',
            hover: 'var(--color-primary-hover)',
            light: 'var(--color-primary-light)',
          },
          secondary: {
            DEFAULT: 'var(--color-secondary)',
            hover: 'var(--color-secondary-hover)',
            light: 'var(--color-secondary-light)',
          },
          accent: {
            DEFAULT: 'var(--color-accent)',
            hover: 'var(--color-accent-hover)',
            light: 'var(--color-accent-light)',
          },
          bg: 'var(--color-background)',
          surface: 'var(--color-surface)',
          subtle: 'var(--color-surface-subtle)',
          muted: 'var(--color-muted)',
          border: 'var(--color-border)',
        },
      },
      fontFamily: {
        sans: ['Vazirmatn', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        polaris: '0.75rem',
      },
      boxShadow: {
        polaris: '0 10px 15px -3px rgba(1, 38, 34, 0.08), 0 4px 6px -2px rgba(1, 38, 34, 0.03)',
        'polaris-lg': '0 20px 25px -5px rgba(1, 38, 34, 0.1), 0 10px 10px -5px rgba(1, 38, 34, 0.04)',
      },
    },
  },
  plugins: [],
}
