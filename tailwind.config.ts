import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f3f7ff',
          100: '#e1ebff',
          200: '#bed4ff',
          300: '#93b5ff',
          400: '#5a8aff',
          500: '#2c5eff',
          600: '#1f46db',
          700: '#1634af',
          800: '#112785',
          900: '#0d1e66'
        }
      }
    }
  },
  plugins: []
};

export default config;
