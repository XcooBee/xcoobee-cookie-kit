const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const ENV = process.env.NODE_ENV || 'development';
const CONFIG = require('./config');
const WEBPACK_CONFIG = require('./webpack.' + ENV + '.config.js');

const xcoobeeConfig = require(CONFIG.config(ENV));

module.exports = Object.assign({}, WEBPACK_CONFIG, {
  entry: Object.assign({}, {
    'xcoobee-cookie-kit': ['core-js/shim', 'core-js/es6/promise', 'core-js/es6/symbol', 'fetch-polyfill', CONFIG.entry]
  }, WEBPACK_CONFIG.entry || {}),
  output: {
    path: CONFIG.dest,
    filename: '[name].min.js',
    chunkFilename: '[chunkhash].min.js',
    publicPath: `${xcoobeeConfig.domain}${CONFIG.publicPath}`
  },
  module: {
    rules: [].concat(
      WEBPACK_CONFIG.module && WEBPACK_CONFIG.module.rules || [],
      [
        {
          test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          use: {
            loader: 'url-loader',
            options: { limit: 10000, minetype: 'application/font-woff' }
          }
        },
        {
          test: /\.(ttf|eot|svg|png|gif)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          use: 'file-loader'
        }
      ]
    )
  },
  optimization: {
    splitChunks: {
      chunks: 'async',
      cacheGroups: {
        default: false
      }
    },
    minimize: ENV === 'production',
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          sequences: true,
          properties: true,
          dead_code: true,
          drop_debugger: true,
          unsafe: true,
          unsafe_comps: false,
          conditionals: true,
          comparisons: true,
          evaluate: true,
          booleans: true,
          loops: true,
          unused: true,
          hoist_funs: true,
          keep_fargs: true,
          keep_fnames: false,
          hoist_vars: false,
          if_return: true,
          join_vars: true,
          collapse_vars: false,
          reduce_vars: true,
          cascade: true,
          side_effects: true,
          pure_getters: false,
          pure_funcs: null,
          negate_iife: true,
          screw_ie8: true,
          drop_console: true,
          angular: true,
          warnings: false,
          passes: 1,
          output: {
            comments: false
          }
        },
        sourceMap: false,
        parallel: true
      })
    ]
  },
  mode: ENV === 'production' ? 'production' : 'development',
  plugins: [].concat(
    [
      new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify(ENV === 'production' ? 'production' : 'development') }),
      new webpack.HashedModuleIdsPlugin(),
    ],
    WEBPACK_CONFIG.plugins || [],
  )
});
