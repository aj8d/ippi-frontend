/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      spacing: {
        1.25: '5px',
        2.5: '10px',
        3.75: '15px',
        4.5: '18px',
        7.5: '30px',
      },
      width: {
        4: '16px',
        4.5: '18px',
        5: '20px',
      },
      height: {
        4: '16px',
        4.5: '18px',
        5: '20px',
      },
      cursor: {
        pointer: 'pointer',
        'not-allowed': 'not-allowed',
      },
    },
  },
  plugins: [],
};
