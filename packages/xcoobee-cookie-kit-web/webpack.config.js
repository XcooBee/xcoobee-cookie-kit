const autoprefixer = require("autoprefixer");
const BrowserSyncPlugin = require("browser-sync-webpack-plugin");
const cssnano = require("cssnano");
const DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");
const HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const proxyMiddleware = require("http-proxy-middleware");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const config = require("./config");

const NODE_ENV = process.env.NODE_ENV || "development";

const isEnvDevelopment = NODE_ENV === "development";
const isEnvProduction = NODE_ENV === "production";

const devServerPort = config.port + 1;

const analyze = process.argv.includes("--analyze");

// console.log("webpack.config.js");
// console.log("NODE_ENV:", NODE_ENV);
// console.log("isEnvDevelopment:", isEnvDevelopment);
// console.log("isEnvProduction:", isEnvProduction);

const webpackConfig = {
  mode: isEnvProduction ? "production" : "development",
  entry: {
    "xcoobee-cookie-kit": [
      "core-js/modules/es6.array.find", // Needed for IE 11
      "core-js/modules/es6.promise", // Needed for IE 11
      "core-js/modules/es6.string.from-code-point", // Needed for IE 11
      "core-js/modules/es7.array.includes", // Needed for IE 11
      "core-js/modules/es7.object.values", // Needed for IE 11
      isEnvDevelopment ? `${__dirname}/src/devOnly.js` : config.entry,
    ],
    "xcoobee-cookie-kit-theme-1": "react-cookie-kit/src/xck-react-theme-1.scss",
    "xcoobee-cookie-kit-theme-2": "react-cookie-kit/src/xck-react-theme-2.scss",
  },
  output: {
    chunkFilename: "[chunkhash].min.js",
    filename: "[name].min.js",
    path: config.dest,
    publicPath: `${process.env.XCK_DOMAIN}${config.publicPath}`,
  },
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
                isEnvProduction && cssnano({
                  preset: "default",
                }),
              ].filter(Boolean),
            },
          },
          "sass-loader",
        ],
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: {
          loader: "url-loader",
          options: { limit: 10000, minetype: "application/font-woff" },
        },
      },
      {
        test: /\.(ttf|eot|svg|png|gif)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: "file-loader",
      },
    ],
  },
  // optimization: {
  //   minimize: false,
  // },
  plugins: [
    new webpack.EnvironmentPlugin([
      "NODE_ENV",
      "XB_API_URL",
      "XB_ORIGIN",
      "XCK_DOMAIN",
    ]),
    new MiniCssExtractPlugin({
      filename: "[name].min.css",
    }),
    new DuplicatePackageCheckerPlugin({
      emitError: true,
      verbose: true,
    }),
    isEnvDevelopment && new BrowserSyncPlugin({
      host: config.host,
      open: config.mode,
      port: config.port,
      proxy: {
        middleware: config.api.map(api => proxyMiddleware(api, { target: config.proxy })),
        target: `localhost:${devServerPort}`,
      },
    }),
    isEnvDevelopment && new HtmlWebpackPlugin(),
    isEnvDevelopment && new HtmlWebpackInlineSourcePlugin(),
    analyze && new BundleAnalyzerPlugin(),
  ].filter(Boolean),
  devServer: isEnvDevelopment
    ? {
      port: devServerPort,
    }
    : undefined,
  devtool: isEnvDevelopment ? "inline-source-map" : false,
  watch: isEnvDevelopment,
};

// console.log("webpackConfig:");
// console.dir(webpackConfig);

module.exports = webpackConfig;
