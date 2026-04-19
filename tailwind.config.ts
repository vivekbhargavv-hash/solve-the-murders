import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Detective theme palette
        noir: {
          950: '#06060d',
          900: '#0a0a0f',
          800: '#12121a',
          700: '#1a1a26',
          600: '#222232',
          500: '#2e2e42',
          400: '#3d3d55',
          300: '#5a5a7a',
          200: '#8080a0',
          100: '#b0b0c8',
          50:  '#e8e8f0',
        },
        crimson: {
          950: '#3d0010',
          900: '#5c0018',
          800: '#8b0020',
          700: '#b3002a',
          600: '#c41e3a',
          500: '#d4364f',
          400: '#e05270',
          300: '#e87a90',
          200: '#f0a8b5',
          100: '#f8d4da',
        },
        gold: {
          900: '#5c3a00',
          800: '#8b5a00',
          700: '#b87800',
          600: '#d4a017',
          500: '#e0b030',
          400: '#ecc050',
          300: '#f5d080',
          200: '#f9e0aa',
          100: '#fdf0d5',
        },
        steel: {
          700: '#1e3a5f',
          600: '#2d5480',
          500: '#3d6fa5',
          400: '#5585b8',
          300: '#789fc8',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
        mono: ['Courier New', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(196, 30, 58, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(196, 30, 58, 0.7)' },
        },
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'glow-red': '0 0 20px rgba(196, 30, 58, 0.4)',
        'glow-gold': '0 0 20px rgba(212, 160, 23, 0.4)',
        'inset-noir': 'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
    },
  },
  plugins: [],
};

export default config;
