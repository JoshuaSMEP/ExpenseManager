/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        glass: {
          card: 'rgba(255, 255, 255, 0.12)',
          border: 'rgba(255, 255, 255, 0.18)',
        },
        accent: {
          primary: '#00f5ff',
          secondary: '#00ddeb',
        },
        success: {
          primary: '#00f5a0',
          secondary: '#00d99a',
        },
        text: {
          heading: '#ffffff',
          body: '#e0e7ff',
        },
        warning: '#ffb800',
      },
      fontFamily: {
        heading: ['Satoshi', 'Clash Display', 'system-ui', 'sans-serif'],
        body: ['Inter', 'SF Pro', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '24px',
        'button': '16px',
      },
      boxShadow: {
        'glass': '0 20px 40px rgba(0, 0, 0, 0.25)',
        'glow': '0 0 30px rgba(0, 245, 255, 0.3)',
        'glow-success': '0 0 30px rgba(0, 245, 160, 0.3)',
      },
      backdropBlur: {
        'glass': '20px',
      },
      animation: {
        'gradient': 'gradient 60s ease infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 245, 255, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 245, 255, 0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
