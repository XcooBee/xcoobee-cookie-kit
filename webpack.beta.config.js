const cssnano = require('cssnano')
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
const CompressionPlugin = require('compression-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const CONFIG = require('./config');
const xcoobeeConfig = require(CONFIG.config('beta'));

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
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [
                autoprefixer,
                cssnano({
                  preset: 'default',
                }),
              ],
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
      filename: '[path].gz',
      algorithm: 'gzip',
      threshold: 10240,
      minRatio: 0.8
    }),
    new CleanWebpackPlugin([CONFIG.dest], {
      root: CONFIG.root,
      verbose: true,
      dry: false
    }),
    new webpack.DefinePlugin({
      'XB_ORIGIN': JSON.stringify(xcoobeeConfig.origin),
      'XCK_DOMAIN': JSON.stringify(xcoobeeConfig.domain),
      'XB_API_URL': JSON.stringify(xcoobeeConfig.apiUrl)
    }),
    new MiniCssExtractPlugin({
      filename: 'xcoobee-cookie-kit.min.css'
    })
  ]
};
