module.exports = {
  mode: 'local',
  host: 'localhost',
  port: 3001,
  proxy: 'http://localhost:3000',
  api: [],
  root: __dirname,
  config: env => `${__dirname}/app/config/${env}.json`,
  entry: `${__dirname}/app`,
  dest: `${__dirname}/dist`,
  publicPath: '/',
  devOnly: `${__dirname}/app/devOnly.js`
};
