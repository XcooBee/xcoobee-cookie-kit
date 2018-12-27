const fse = require('fs-extra');
const path = require('path');

const packageDir = path.resolve(__dirname, '..')
const srcDir = path.resolve(packageDir, 'src')
const outDir = path.resolve(packageDir, 'dist')

let filenames;

filenames = [
  // 'AccessTokenManager.js',
  // 'configs.js',
  // 'cookieConsentsCache.js',
  // 'CookieConsentsManager.js',
  // 'graphql.js',
  // 'index.js',
  // 'NotAuthorizedError.js',
  // 'renderText.js',
  'l10n/messages.de-de.json',
  'l10n/messages.en-us.json',
  'l10n/messages.es-419.json',
  'l10n/messages.fr-fr.json',
];

filenames.forEach(filename => {
  let inputFilename, outputFilename;

  inputFilename = path.resolve(srcDir, filename);
  outputFilename = path.resolve(outDir, filename);
  fse.copy(inputFilename, outputFilename);
});
