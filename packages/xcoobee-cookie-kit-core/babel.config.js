const presets = [
  [
    "@babel/preset-env",
    {
      targets: {
        browsers: [
          "last 2 versions",
          "ie >= 11",
        ],
      },
    },
  ],
];

const plugins = [
  "@babel/plugin-proposal-class-properties",
];

module.exports = {
  plugins,
  presets,
};
