const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
const CompressionPlugin = require('compression-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const CONFIG = require('./config');

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: 'babel-loader'
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              minimize: {
                discardComments: { removeAll: true }
              }
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: function () {
                return [autoprefixer];
              }
            }
          },
          { loader: 'sass-loader' }
        ]
      }
    ]
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      errorDetails: true,
      debug: false
    }),
    new CompressionPlugin({
      asset: '[path].gz',
      algorithm: 'gzip',
      threshold: 10240,
      minRatio: 0.8
    }),
    new CleanWebpackPlugin([CONFIG.dest], {
      root: CONFIG.root,
      verbose: true,
      dry: false
    }),
    new MiniCssExtractPlugin({
      filename: 'xcoobee-cookie-kit.min.css'
    })
  ]
};
