import { readdir, readFile, stat } from "node:fs";
import { basename, extname, join } from "node:path";

const pathSet = new Set();
export function recursiveFind(path, keyword, queue) {
    if (pathSet.has(path)) {
        return;
    }

    pathSet.add(path);

    queue.pushTask((cb) => {
        scanDir(path, keyword, queue, cb);
    });
}

function scanDir(path, keyword, queue, cb) {
    readdir(path, (err, entries) => {
        if (err) {
            return cb(err);
        }

        dirEntries(path, entries, keyword, queue, cb);
    });
}

function dirEntries(path, entries, keyword, queue, cb) {
    let pending = entries.length;

    function isDone() {
        if (--pending === 0) {
            return cb();
        }
    }

    entries.forEach((entry) => {
        const currPath = join(path, entry);

        stat(currPath, (err, stats) => {
            if (err) {
                return cb(err);
            }

            if (stats.isDirectory()) {
                recursiveFind(currPath, keyword, queue);
            } else if (extname(currPath) === ".txt") {
                findKeyword(currPath, keyword, queue);
            }

            isDone();
        });
    });
}

function findKeyword(path, keyword, queue) {
    queue.pushTask((cb) => {
        scanFile(path, keyword, queue, cb);
    });
}

function scanFile(path, keyword, queue, cb) {
    readFile(path, { encoding: "utf8", flag: "r" }, (err, data) => {
        if (err) {
            return cb(err);
        }

        if (data.includes(keyword)) {
            queue.pushStore(basename(path));
        }

        return cb();
    });
}
