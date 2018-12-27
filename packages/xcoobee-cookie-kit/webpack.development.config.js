/* eslint-disable import/no-dynamic-require, import/no-extraneous-dependencies */

const autoprefixer = require("autoprefixer");
const BrowserSyncPlugin = require("browser-sync-webpack-plugin");
const proxyMiddleware = require("http-proxy-middleware");
const HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");

const CONFIG = require("./config");

const xcoobeeConfig = require(CONFIG.config("development"));

const WEBPACK_PORT = CONFIG.port + 1;

module.exports = {
  entry: { devOnly: CONFIG.devOnly },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: "babel-loader",
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              plugins: () => [autoprefixer],
            },
          },
          "sass-loader",
        ],
      },
    ],
  },
  watch: true,
  devServer: {
    clientLogLevel: "none",
    disableHostCheck: true,
    historyApiFallback: true,
    inline: true,
    noInfo: false,
    port: WEBPACK_PORT,
    quiet: false,
    stats: {
      assets: false,
      chunkModules: false,
      chunks: true,
      colors: true,
      hash: false,
      timings: false,
      version: false,
    },
  },
  devtool: "inline-source-map",
  plugins: [
    new webpack.LoaderOptionsPlugin({
      debug: true,
      errorDetails: true,
    }),
    new BrowserSyncPlugin({
      host: CONFIG.host,
      open: CONFIG.mode,
      port: CONFIG.port,
      proxy: {
        middleware: CONFIG.api.map(api => proxyMiddleware(api, { target: CONFIG.proxy })),
        target: `localhost:${WEBPACK_PORT}`,
      },
    }),
    new webpack.DefinePlugin({
      "process.env.XB_API_URL": JSON.stringify(xcoobeeConfig.apiUrl),
      "process.env.XB_ORIGIN": JSON.stringify(xcoobeeConfig.origin),
      "process.env.XCK_DOMAIN": JSON.stringify(xcoobeeConfig.domain),
    }),
    new HtmlWebpackPlugin(),
    new HtmlWebpackInlineSourcePlugin(),
    new MiniCssExtractPlugin({
      filename: "xcoobee-cookie-kit.min.css",
    }),
  ],
};
