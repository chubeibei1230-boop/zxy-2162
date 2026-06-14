/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#b9d2ff',
          300: '#8cb3ff',
          400: '#5a8cff',
          500: '#3366ff',
          600: '#1e49d9',
          700: '#1e3a5f',
          800: '#172a47',
          900: '#0f1c30',
        },
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#f43f5e',
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(16, 42, 67, 0.08), 0 1px 2px rgba(16, 42, 67, 0.06)',
        'card-hover': '0 4px 12px rgba(16, 42, 67, 0.1), 0 2px 4px rgba(16, 42, 67, 0.08)',
      },
      animation: {
        'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};
