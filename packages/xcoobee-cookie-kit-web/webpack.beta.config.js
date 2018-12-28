/* eslint-disable import/no-dynamic-require, import/no-extraneous-dependencies */
const autoprefixer = require("autoprefixer");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const cssnano = require("cssnano");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");

const CONFIG = require("./config");

module.exports = {
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
              plugins: () => [
                autoprefixer,
                cssnano({
                  preset: "default",
                }),
              ],
            },
          },
          "sass-loader",
        ],
      },
    ],
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      debug: false,
      errorDetails: true,
    }),
    new CompressionPlugin({
      algorithm: "gzip",
      filename: "[path].gz",
      minRatio: 0.8,
      threshold: 10240,
    }),
    new CleanWebpackPlugin([CONFIG.dest], {
      dry: false,
      root: CONFIG.root,
      verbose: true,
    }),
    new webpack.DefinePlugin({
      "process.env.XB_API_URL": process.env.XB_API_URL,
      "process.env.XB_ORIGIN": process.env.XB_ORIGIN,
      "process.env.XCK_DOMAIN": process.env.XCK_DOMAIN,
    }),
    new MiniCssExtractPlugin({
      filename: "xcoobee-cookie-kit.min.css",
    }),
  ],
};
