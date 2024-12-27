module.exports = {
  content: [
    './public/index.html',
    './src/**/*.{js,jsx,ts,tsx}', // More comprehensive content path
    './src/App.js',
    './src/Components/*',
    './src/utility/*',
    './src/pages/*',
    './src/utilities/*'
  ],
  theme: {
    extend: {
    },
  },
  plugins: [
    // You can add Tailwind plugins here if needed
  ],
};