/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#09090b',
          secondary: '#111115',
          elevated: '#17171d',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          light: 'rgb(var(--accent-light) / <alpha-value>)',
        },
        ivory: '#f7ece6',
        glass: {
          DEFAULT: 'rgba(247, 236, 230, 0.045)',
          border: 'rgba(247, 236, 230, 0.11)',
          hover: 'rgba(247, 236, 230, 0.09)',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', 'sans-serif'],
        display: ['Manrope', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 28px rgb(var(--accent) / 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        'glow-sm': '0 0 16px rgb(var(--accent) / 0.26), inset 0 1px 0 rgba(255, 255, 255, 0.10)',
        glass: '0 14px 36px -10px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.09)',
        'glass-hover': '0 20px 44px -12px rgba(0, 0, 0, 0.78), 0 0 22px rgb(var(--accent) / 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.16)',
      },
    },
  },
  plugins: [],
}