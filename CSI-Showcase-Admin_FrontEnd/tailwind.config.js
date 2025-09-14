/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Add custom colors that match the main frontend
      colors: {
        primary: '#90278E',
        secondary: '#FF5E8C',
        darkBackground: '#0D0221',
        lightBackground: '#F9F5FF',
        textDark: '#424242',
        textLight: '#FFFFFF',
        textMuted: '#808080',
      },
      // Add custom gradients
      backgroundImage: {
        'primary-gradient': 'linear-gradient(to right, #90278E, #FF5E8C)',
        'dark-gradient': 'linear-gradient(to bottom, rgba(13, 2, 33, 0.6), rgba(13, 2, 33, 0.9))',
        'space-gradient': 'linear-gradient(180deg, #90278E 0%, #6A1B68 100%)',
      },
      // Add custom animations
      animation: {
        'border-beam': 'border-beam linear infinite',
        'meteor-effect': 'meteor-effect linear infinite',
      },
      // Add custom keyframes
      keyframes: {
        'border-beam': {
          '0%': { 'offset-distance': '0%' },
          '100%': { 'offset-distance': '100%' }
        },
        'meteor-effect': {
          from: {
            transform: 'translateX(-100px) translateY(-50px)'
          },
          to: {
            transform: 'translateX(calc(100vw + 100px)) translateY(calc(100vh + 50px))'
          }
        }
      },
      // Add font families
      fontFamily: {
        'sukhumvit': ['SukhumvitSet', 'sans-serif'],
        'ubuntu': ['Ubuntu', 'sans-serif'],
      },
      // Add glass effect utilities
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}