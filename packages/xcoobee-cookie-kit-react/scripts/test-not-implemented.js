/* eslint-disable guard-for-in, no-console */

const fs = require("fs");

const checkPath = "node_modules";

if (fs.existsSync(checkPath)) {
  console.log("found node modules directory");

  console.log(checkPath);

  const files = fs.readdirSync(checkPath);

  // eslint-disable-next-line guard-for-in
  // eslint-disable-next-line no-restricted-syntax
  for (const item in files) {
    console.log(files[item]);
  }
} else {
  console.log("NO node modules. `yarn` must have failed");

  console.log(__dirname);

  const files = fs.readdirSync(__dirname);

  // eslint-disable-next-line guard-for-in
  // eslint-disable-next-line no-restricted-syntax
  for (const item in files) {
    console.log(files[item]);
  }
}

console.log("--------------------------------------");
console.log("we have not implemented unit test yet.");
process.exit(0);
