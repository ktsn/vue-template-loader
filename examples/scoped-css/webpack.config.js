const path = require('path')

module.exports = {
  context: path.resolve(__dirname),
  entry: './main.js',
  output: {
    path: path.resolve(__dirname),
    filename: '__build__.js'
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: '../../', // vue-template-loader
        options: {
          scoped: true
        }
      },
      {
        enforce: 'post',
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
}
