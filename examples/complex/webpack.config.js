const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

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
              transformAssetUrls: {
                img: 'src'
              }
            }
          },
          'pug-html-loader'
        ]
      },
      {
        test: /\.scss/,
        loader: 'sass-loader',
        options: {
          sourceMap: true
        }
      },
      {
        enforce: 'post',
        test: /\.s?css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          }
        ]
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
    }),
    new MiniCssExtractPlugin({
      filename: 'style.css'
    })
  ]
}
