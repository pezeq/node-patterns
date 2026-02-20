import { join, extname, basename } from "node:path";
import { readdir, readFile, stat } from "node:fs";

export function recursiveFind(path, keyword, cb) {
    const textFiles = [];
    let pending = 1;

    function isDone() {
        if (--pending === 0) {
            return searchForKeyword(textFiles, keyword, cb);
        }
    }

    function scanDir(path) {
        console.log("Scanning path:", path);

        readdir(path, (err, files) => {
            if (err) {
                return cb(err);
            }

            pending += files.length;
            isDone();

            for (const file of files) {
                const currPath = join(path, file);

                stat(currPath, (err, stats) => {
                    if (err) {
                        return cb(err);
                    }

                    if (stats.isDirectory()) {
                        return scanDir(currPath);
                    }

                    if (extname(currPath) === ".txt") {
                        textFiles.push(currPath);
                    }

                    isDone();
                });
            }
        });
    }

    scanDir(path);
}

function searchForKeyword(files, keyword, cb) {
    const foundData = [];

    function searching() {
        if (files.length === 0) {
            return cb(null, foundData);
        }

        const currPath = files.shift();

        console.log("Searching for keyword in:", currPath);

        readFile(currPath, { encoding: "utf8", flag: "r" }, (err, content) => {
            if (err) {
                return cb(err);
            }

            if (content.includes(keyword)) {
                foundData.push(basename(currPath));
            }

            searching();
        });
    }

    searching();
}
