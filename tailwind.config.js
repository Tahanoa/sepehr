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
          evergreen: '#012622',
          darkgreen: '#003B36',
          lavender: '#ECE5F0',
          amber: '#E98A15',
          purple: '#59114D',
        },
        polaris: {
          primary: {
            DEFAULT: '#012622',
            hover: '#003B36',
            light: 'rgba(1, 38, 34, 0.08)',
          },
          secondary: {
            DEFAULT: '#59114D',
            hover: '#480d3e',
            light: 'rgba(89, 17, 77, 0.08)',
          },
          accent: {
            DEFAULT: '#E98A15',
            hover: '#d2790d',
            light: 'rgba(233, 138, 21, 0.12)',
          },
          bg: '#F8F7FA',
          surface: '#FFFFFF',
          subtle: '#F3EEF6',
          muted: '#728280',
          border: '#D8E0DF',
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
