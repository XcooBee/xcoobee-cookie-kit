"use strict";

// This script will DELETE all non build directories. We use it for the build process.
// DO NOT RUN IN DEVELOPMENT

const fs = require("fs");
const path = require("path");


// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
// we do not stop for errors
process.on('unhandledRejection', err => {
  // throw err;
  console.log("error during delete: ", err)
});

const dirsToDelete =  ["src","node_modules",".git"]


function deleteFile(dir, file) {
    return new Promise(function (resolve, reject) {
        var filePath = path.join(dir, file);
        fs.lstat(filePath, function (err, stats) {
            if (err) {
                return reject(err);
            }
            if (stats.isDirectory()) {
                resolve(deleteDirectory(filePath));
            } else {
                fs.unlink(filePath, function (err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            }
        });
    });
};

function deleteDirectory(dir) {
    if (dir.length < 5) {
        return Promise.reject(`insufficient length for directory [${dir}]`)
    }
    return new Promise(function (resolve, reject) {
        fs.access(dir, function (err) {
            if (err) {
                return reject(err);
            }
            fs.readdir(dir, function (err, files) {
                if (err) {
                    return reject(err);
                }
                Promise.all(files.map(function (file) {
                    return deleteFile(dir, file);
                })).then(function () {
                    fs.rmdir(dir, function (err) {
                        if (err) {
                            return reject(err);
                        }
                        resolve();
                    });
                }).catch(reject);
            });
        });
    });
};

// run actual delete process
dirsToDelete.forEach((relDir) => {
    console.log("processing for delete: ", path.resolve(relDir));
    deleteDirectory(path.resolve(relDir));
});

console.log("please wait this is going to take a bit ...");
