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
      { test: /\.html$/, use: '../' },
      { enforce: 'post', test: /\.css$/, use: ['style-loader', 'css-loader'] }
    ]
  }
}
