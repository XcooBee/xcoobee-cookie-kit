const webpack = require('webpack');
const proxyMiddleware = require('http-proxy-middleware');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

const CONFIG = require('./config');
const xcoobeeConfig = require(CONFIG.config('development'));

const WEBPACK_PORT = CONFIG.port + 1;

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
          'css-loader',
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
    new webpack.DefinePlugin({
      'XB_ORIGIN': JSON.stringify(xcoobeeConfig.origin),
      'XCK_DOMAIN': JSON.stringify(xcoobeeConfig.domain),
      'XB_API_URL': JSON.stringify(xcoobeeConfig.apiUrl)
    }),
    new HtmlWebpackPlugin(),
    new HtmlWebpackInlineSourcePlugin(),
    new MiniCssExtractPlugin({
      filename: 'xcoobee-cookie-kit.min.css'
    })
  ]
};
