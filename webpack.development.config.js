const webpack = require('webpack');
const proxyMiddleware = require('http-proxy-middleware');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AsyncStylesheetWebpackPlugin = require('async-stylesheet-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

const CONFIG = require('./config');
const WEBPACK_PORT = CONFIG.port + 1;
const ENV = process.env.NODE_ENV || 'development';

module.exports = {
  entry: { devOnly: CONFIG.devOnly },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          { loader: 'babel-loader' }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: 'css-loader' },
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
  watch: true,
  devtool: 'inline-source-map',
  devServer: {
    clientLogLevel: 'none',
    historyApiFallback: true,
    inline: true,
    quiet: false,
    noInfo: false,
    disableHostCheck: true,
    stats: {
      assets: false,
      colors: true,
      version: false,
      hash: false,
      timings: false,
      chunks: true,
      chunkModules: false
    },
    port: WEBPACK_PORT
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      errorDetails: true,
      debug: true
    }),
    new BrowserSyncPlugin({
      open: CONFIG.mode,
      host: CONFIG.host,
      port: CONFIG.port,
      proxy: {
        target: `localhost:${WEBPACK_PORT}`,
        middleware: CONFIG.api.map(api => proxyMiddleware(api, { target: CONFIG.proxy }))
      }
    }),
    new HtmlWebpackPlugin(),
    new HtmlWebpackInlineSourcePlugin(),
    new MiniCssExtractPlugin({
      filename: 'xcoobee-cookie-kit.min.css'
    })
  ]
};
