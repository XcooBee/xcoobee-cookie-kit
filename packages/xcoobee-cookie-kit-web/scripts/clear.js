/* eslint-disable no-console */

// This script will DELETE all non build directories. We use it for the build process.
// DO NOT RUN IN DEVELOPMENT

const fs = require("fs");
const path = require("path");


// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
// we do not stop for errors
process.on("unhandledRejection", (err) => {
  // throw err;
  console.error("error during delete: ", err);
});

const dirsToDelete = ["src", "node_modules", ".git"];

function deleteDirectory(dir) {
  if (dir.length < 5) {
    return Promise.reject(Error(`insufficient length for directory [${dir}]`));
  }
  return new Promise((resolve, reject) => {
    fs.access(dir, (err) => {
      if (err) {
        reject(err);
        return;
      }
      fs.readdir(dir, (err1, files) => {
        if (err1) {
          reject(err1);
          return;
        }
        // eslint-disable-next-line no-use-before-define
        Promise.all(files.map(file => deleteFile(dir, file)))
          .then(() => {
            fs.rmdir(dir, (err2) => {
              if (err2) {
                reject(err2);
                return;
              }
              resolve();
            });
          })
          .catch(reject);
      });
    });
  });
}

function deleteFile(dir, file) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(dir, file);
    fs.lstat(filePath, (err, stats) => {
      if (err) {
        reject(err);
        return;
      }
      if (stats.isDirectory()) {
        resolve(deleteDirectory(filePath));
      } else {
        fs.unlink(filePath, (err1) => {
          if (err1) {
            reject(err1);
            return;
          }
          resolve();
        });
      }
    });
  });
}

// run actual delete process
dirsToDelete.forEach((relDir) => {
  console.log("processing for delete: ", path.resolve(relDir));
  deleteDirectory(path.resolve(relDir));
});

console.log("please wait this is going to take a bit ...");
