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
        // Neobrutalism color palette
        'neo-violet': {
          100: '#A8A6FF',
          200: '#918efa', 
          300: '#807dfa'
        },
        'neo-pink': {
          100: '#FFA6F6',
          200: '#fa8cef',
          300: '#fa7fee'
        },
        'neo-red': {
          100: '#FF9F9F',
          200: '#fa7a7a',
          300: '#f76363'
        },
        'neo-orange': {
          100: '#FFC29F',
          200: '#FF965B',
          300: '#fa8543'
        },
        'neo-yellow': {
          100: '#FFF066',
          200: '#FFE500'
        },
        'neo-lime': {
          100: '#B8FF9F',
          200: '#9dfc7c',
          300: '#7df752'
        },
        'neo-cyan': {
          100: '#A6FAFF',
          200: '#79F7FF',
          300: '#53f2fc'
        },
        'neo-black': '#000000',
        'neo-white': '#FFFFFF'
      },
      fontFamily: {
        'neo': ['system-ui', 'sans-serif'],
        'neo-mono': ['ui-monospace', 'monospace']
      },
      boxShadow: {
        'neo': '4px 4px 0px 0px #000000',
        'neo-sm': '2px 2px 0px 0px #000000',
        'neo-lg': '8px 8px 0px 0px #000000',
        'neo-xl': '12px 12px 0px 0px #000000',
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
        '5': '5px'
      }
    },
  },
  plugins: [],
}