/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        colors: {
          thunder: {
            primary: '#036AA6', // Blue
            'primary-lighter': '#0a8fd4',
            secondary: '#F5BC3A', // Gold
            dark: '#1E293B', // Slate Blue
            background: '#F8FAFC' // Light Gray
          },
        },
        fontFamily: {
          sans: ['var(--font-inter)', 'Arial', 'sans-serif'],
        },
        transitionProperty: {
          'width': 'width',
          'height': 'height',
        }
      },
    },
    plugins: [],
  }