const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  context: path.resolve(__dirname),
  entry: './main.ts',
  output: {
    path: path.resolve(__dirname, '__build__'),
    filename: 'build.js'
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader'
      },
      {
        test: /\.pug$/,
        use: [
          {
            loader: '../../', // vue-template-loader
            options: {
              scoped: true,
              transformToRequire: {
                img: 'src'
              }
            }
          },
          'pug-html-loader'
        ]
      },
      {
        test: /\.scss/,
        loader: 'sass-loader'
      },
      {
        enforce: 'post',
        test: /\.s?css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.png/,
        loader: 'file-loader'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html'
    })
  ]
}
