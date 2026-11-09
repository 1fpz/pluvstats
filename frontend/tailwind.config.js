/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        abyss: '#04121F',
        navy: {
          950: '#04121F',
          900: '#081F33',
          850: '#0A2438',
          800: '#0D2B42',
          700: '#123650',
          600: '#1A4563',
        },
        cyan: {
          DEFAULT: '#00A6CC',
          300: '#7FE0F5',
          400: '#2BC4E6',
          500: '#00A6CC',
          600: '#0089A8',
          700: '#006F8A',
        },
        petrol: {
          DEFAULT: '#148B86',
          400: '#1FB3AC',
          600: '#0E6F6B',
        },
        mist: '#F4F8FC',
        ink: '#E6F1F8',
        muted: '#8AA4B8',
        line: 'rgba(148, 184, 208, 0.14)',
        warning: '#F59E0B',
        critical: '#EF4444',
        success: '#22C55E',
      },
      fontFamily: {
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        panel: '0 20px 60px -32px rgba(0, 0, 0, 0.85)',
        glow: '0 0 0 1px rgba(0, 166, 204, 0.28), 0 0 28px -6px rgba(0, 166, 204, 0.45)',
        'glow-critical': '0 0 0 1px rgba(239, 68, 68, 0.35), 0 0 28px -8px rgba(239, 68, 68, 0.5)',
      },
      backgroundImage: {
        'grid-soft':
          'linear-gradient(rgba(148,184,208,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(148,184,208,0.05) 1px, transparent 1px)',
        'hero-glow':
          'radial-gradient(900px 420px at 12% -10%, rgba(0,166,204,0.16), transparent 60%), radial-gradient(700px 340px at 92% 0%, rgba(20,139,134,0.12), transparent 60%)',
      },
      backgroundSize: {
        grid: '32px 32px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-600px 0' },
          '100%': { backgroundPosition: '600px 0' },
        },
        'ping-slow': {
          '0%': { transform: 'scale(1)', opacity: '0.55' },
          '80%, 100%': { transform: 'scale(2.4)', opacity: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
        shimmer: 'shimmer 1.6s linear infinite',
        'ping-slow': 'ping-slow 2.6s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
}
