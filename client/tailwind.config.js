/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        field: {
          green: '#2d5a27',
          light: '#3a7a33',
          line: '#ffffff',
        },
        nfl: {
          dark: '#013369',
          red: '#d50a0a',
          gold: '#c9a84c',
        },
      },
      fontFamily: {
        display: ['Impact', 'Arial Narrow', 'sans-serif'],
        ui: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
