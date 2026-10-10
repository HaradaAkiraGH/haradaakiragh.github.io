/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0d0d0f',
          secondary: '#121214',
        },
        // Акцент = CSS-переменная: палитры меняются без перезагрузки
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          light: 'rgb(var(--accent-light) / <alpha-value>)',
        },
        ivory: '#f7ece6',
        glass: {
          DEFAULT: 'rgba(247, 236, 230, 0.05)',
          border: 'rgba(247, 236, 230, 0.10)',
          hover: 'rgba(247, 236, 230, 0.12)',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgb(var(--accent) / 0.35)',
        'glow-sm': '0 0 12px rgb(var(--accent) / 0.30)',
      },
    },
  },
  plugins: [],
}