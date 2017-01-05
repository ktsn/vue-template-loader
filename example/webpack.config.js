const path = require('path')

module.exports = {
  context: path.resolve(__dirname),
  entry: './main.js',
  output: {
    path: path.resolve(__dirname),
    filename: '__build__.js'
  },
  module: {
    rules: [
      /**
       * Scoped styles
       */
      {
        test: /\.html$/,
        exclude: /components\/css-modules/,
        use: '../?scoped' // vue-template-loader?scoped
      },
      {
        enforce: 'post',
        test: /\.css$/,
        exclude: /components\/css-modules/,
        use: ['style-loader', 'css-loader']
      },

      /**
       * CSS Modules
       */
      {
        test: /\.html$/,
        include: /components\/css-modules/,
        use: '../' // vue-template-loader
      },
      {
        enforce: 'post',
        test: /\.css$/,
        include: /components\/css-modules/,
        use: ['style-loader', 'css-loader?modules']
      }
    ]
  }
}
