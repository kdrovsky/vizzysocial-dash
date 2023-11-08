const withMT = require("@material-tailwind/react/utils/withMT");

/** @type {import('tailwindcss').Config} */
module.exports = withMT({
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        nav: '0px 6px 11px -7px rgba(6, 21, 56, 0.08)',
        stats:
          '0px 0px 1px rgba(12, 26, 75, 0.1), 0px 4px 20px -2px rgba(50, 50, 71, 0.08)',
        automode: '0px 4px 4px rgba(0, 0, 0, 0.25)',
        targeting: '0px 4px 53px rgba(0, 0, 0, 0.1)',
        subs: '0px 2px 2px rgba(0, 0, 0, 0.25)',
        subs2: '0 0 2px rgba(0, 0, 0, 0.25)',
        filter: '0px 0px 5px rgba(0, 0, 0, 0.25)',
      },
      colors: {
        gray20: '#333333',
        inputbkgrd: '#F8F8F8',
        primary: '#3D56EA', // blue
        secondary: '#D81159', // red
        secondary_hover: '#A3003B', // dark red
        btngreen: '#34B53A',
        btnred: '#EB6402',
        bgicongreen: '#E2FBD7',
        bgiconred: '#FFE5D3',
        activelink: '#ECECEC',
      },
    },
    fontFamily: {
      MADEOKINESANSPERSONALUSE: 'MADEOKINESANSPERSONALUSE, sans-serif',
      MontserratRegular: 'Montserrat-Regular, sans-serif',
      MontserratLight: 'Montserrat-Light, sans-serif',
      MontserratSemiBold: 'Montserrat-SemiBold, sans-serif',
      MontserratBold: 'Montserrat-Bold, sans-serif',
    },
  },
  plugins: [],
  important: true,
});
