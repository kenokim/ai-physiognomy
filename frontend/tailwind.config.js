/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#fef7f0',
          100: '#feeee0',
          200: '#fbd9b8',
          300: '#f8be85',
          400: '#f59e52',
          500: '#f3822f',
          600: '#e36815',
          700: '#bc5114',
          800: '#954218',
          900: '#783816',
        }
      }
    },
  },
  plugins: [],
} 