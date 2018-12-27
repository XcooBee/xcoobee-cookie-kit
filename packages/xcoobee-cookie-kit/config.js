module.exports = {
  mode: "local",
  host: "localhost",
  port: 3001,
  proxy: "http://localhost:3000",
  api: [],
  root: __dirname,
  config: env => `${__dirname}/src/config/${env}.json`,
  entry: `${__dirname}/src`,
  dest: `${__dirname}/dist`,
  publicPath: "/",
  devOnly: `${__dirname}/src/devOnly.js`,
};
