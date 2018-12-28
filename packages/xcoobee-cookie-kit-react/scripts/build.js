const path = require("path");

// eslint-disable-next-line import/no-extraneous-dependencies
const fse = require("fs-extra");

const packageDir = path.resolve(__dirname, "..");
const srcDir = path.resolve(packageDir, "src");
const outDir = path.resolve(packageDir, "dist");

const filenames = [
  // "CookieKit.js",
  // "CookieKitContainer.js",
  // "CookieKitPopup.js",
  // "index.js",
  // TODO: Convert this to a css file.
  "main.scss",
  "assets/close-icon.svg",
  "assets/cookie-blue.svg",
  "assets/cookie-green.svg",
  "assets/cookie-red.svg",
  "assets/cookie-yellow.svg",
  "assets/cookie.svg",
  "assets/xcoobee-logo.svg",
  // "lib/ConsentStatusShape.js",
  // "lib/CookieConsentShape.js",
];

filenames.forEach((filename) => {
  const inputFilename = path.resolve(srcDir, filename);
  const outputFilename = path.resolve(outDir, filename);
  fse.copy(inputFilename, outputFilename);
});
