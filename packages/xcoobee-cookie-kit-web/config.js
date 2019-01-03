module.exports = {
  dest: `${__dirname}/dist`,
  entry: `${__dirname}/src/index.js`,
  publicPath: "/",

  // Development Related:
  api: [],
  host: "localhost",
  mode: "local",
  port: 3001,
  proxy: "http://localhost:3000",
};
