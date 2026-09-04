import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#090d16',
        surface: '#0f172a',
        'surface-card': '#162032',
        'surface-hover': '#1e293b',
        border: '#1e293b',
        'border-bright': '#334155',
        primary: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
          glow: 'rgba(59, 130, 246, 0.4)',
        },
        cyan: {
          accent: '#06b6d4',
          glow: 'rgba(6, 182, 212, 0.4)',
        },
        neon: {
          DEFAULT: '#10b981',
          hover: '#059669',
          glow: 'rgba(16, 185, 129, 0.4)',
        },
        amber: {
          accent: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 25px -5px rgba(59, 130, 246, 0.3)',
        'cyan-glow': '0 0 25px -5px rgba(6, 182, 212, 0.3)',
        'neon-glow': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(59, 130, 246, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
};

export default config;
