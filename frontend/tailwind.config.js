/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        abyss: '#0A0B0D',
        navy: {
          950: '#0B0D10',
          900: '#101317',
          850: '#14181C',
          800: '#191D22',
          700: '#23282E',
          600: '#2E343B',
        },
        cyan: {
          DEFAULT: '#4F9E98',
          300: '#8FD0CA',
          400: '#67B3AC',
          500: '#4F9E98',
          600: '#3F827C',
          700: '#326662',
        },
        petrol: {
          DEFAULT: '#3F7F74',
          400: '#5E9E92',
          600: '#2F6259',
        },
        mist: '#F3F5F6',
        ink: '#D5DBDF',
        muted: '#8B949B',
        line: 'rgba(255, 255, 255, 0.075)',
        warning: '#C9A15A',
        alert: '#C9855A',
        critical: '#C96A6A',
        success: '#63A98A',
      },
      fontFamily: {
        display: ['"Public Sans Variable"', 'Public Sans', 'system-ui', 'sans-serif'],
        sans: ['"Public Sans Variable"', 'Public Sans', 'system-ui', 'sans-serif'],
        mono: ['"Public Sans Variable"', 'Public Sans', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 2px rgba(0, 0, 0, 0.45), 0 12px 32px -24px rgba(0, 0, 0, 0.9)',
        float: '0 16px 40px -20px rgba(0, 0, 0, 0.85)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-600px 0' },
          '100%': { backgroundPosition: '600px 0' },
        },
        'ping-slow': {
          '0%': { transform: 'scale(1)', opacity: '0.5' },
          '80%, 100%': { transform: 'scale(2.1)', opacity: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
        shimmer: 'shimmer 1.8s linear infinite',
        'ping-slow': 'ping-slow 2.8s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
}
