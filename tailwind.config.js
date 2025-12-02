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
        'float-slow': 'float 6s ease-in-out infinite',
        'float-slower': 'float 8s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'shimmer-slow': 'shimmer 3s linear infinite',
        'glow-trail': 'glow-trail 2s ease-out forwards',
        'draw-line': 'draw-line 1.5s ease-out forwards',
        'counter-up': 'counter-up 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.5s ease-out',
        'rotate-slow': 'rotate-slow 20s linear infinite',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'morph': 'morph 8s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
        'fade-in': 'fade-in 0.5s ease-out forwards',
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
        'glow-trail': {
          '0%': { strokeDashoffset: '1000', filter: 'drop-shadow(0 0 2px rgba(0, 245, 255, 0.3))' },
          '50%': { filter: 'drop-shadow(0 0 8px rgba(0, 245, 255, 0.8))' },
          '100%': { strokeDashoffset: '0', filter: 'drop-shadow(0 0 4px rgba(0, 245, 255, 0.5))' },
        },
        'draw-line': {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        'counter-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'rotate-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.95)', opacity: '0.8' },
          '50%': { transform: 'scale(1.05)', opacity: '0.4' },
          '100%': { transform: 'scale(0.95)', opacity: '0.8' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'sparkle': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        'morph': {
          '0%, 100%': { borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40%/50% 60% 30% 60%' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
