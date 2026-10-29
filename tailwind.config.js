/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,js,html}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          evergreen: 'rgb(var(--theme-primary) / <alpha-value>)',
          darkgreen: 'rgb(var(--theme-hover) / <alpha-value>)',
          lavender: 'rgb(var(--theme-subtle) / <alpha-value>)',
          amber: 'rgb(var(--theme-accent) / <alpha-value>)',
          purple: 'rgb(var(--theme-secondary) / <alpha-value>)',
        },
        polaris: {
          primary: {
            DEFAULT: 'rgb(var(--theme-primary) / <alpha-value>)',
            hover: 'rgb(var(--theme-hover) / <alpha-value>)',
            light: 'rgb(var(--theme-primary) / 0.08)',
          },
          secondary: {
            DEFAULT: 'rgb(var(--theme-secondary) / <alpha-value>)',
            hover: 'rgb(var(--theme-secondary) / <alpha-value>)',
            light: 'rgb(var(--theme-secondary) / 0.08)',
          },
          accent: {
            DEFAULT: 'rgb(var(--theme-accent) / <alpha-value>)',
            hover: 'rgb(var(--theme-accent) / <alpha-value>)',
            light: 'rgb(var(--theme-accent) / 0.12)',
          },
          bg: '#F8F7FA',
          surface: '#FFFFFF',
          subtle: '#F3EEF6',
          muted: '#728280',
          border: '#D8E0DF',
        },
      },
      fontFamily: {
        sans: ['var(--font-family-base)'],
      },
      borderRadius: {
        lg: 'var(--radius-lg)', xl: 'var(--radius-xl)', '2xl': 'var(--radius-xl)', '3xl': 'var(--radius-xl)',
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
