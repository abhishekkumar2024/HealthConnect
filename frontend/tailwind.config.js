module.exports = {
  content: [
    
    './public/index.html', // Include HTML file
    './src/App.js',
    './src/Components/*', // Include all React component files
    './src/utility/Cards.js',
    './src/utility/DoctorCard.js',
    './src/utility/*'
  ],
  theme: {
    // colors: {
    //   cardtheme:"#a6a0a7",
    // },
    extend: {},
  },
  plugins: [
  ],
};
