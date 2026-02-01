/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(270 50% 4%)',
        foreground: 'hsl(270 10% 95%)',
        primary: {
          DEFAULT: 'hsl(270 70% 60%)',
          foreground: 'hsl(0 0% 100%)',
        },
        card: {
          DEFAULT: 'hsl(270 30% 7%)',
          foreground: 'hsl(270 10% 95%)',
        },
        accent: {
          DEFAULT: 'hsl(280 60% 50%)',
          foreground: 'hsl(0 0% 100%)',
        },
        muted: {
          DEFAULT: 'hsl(270 20% 15%)',
          foreground: 'hsl(270 10% 65%)',
        },
        border: 'hsl(270 30% 15%)',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'twinkle': {
          '0%, 100%': { opacity: 0.3 },
          '50%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}
