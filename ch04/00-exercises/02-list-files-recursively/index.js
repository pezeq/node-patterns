import * as fs from "node:fs";
import { isAbsolute, join } from "node:path";

function scanDir(path, cb) {
    const fileList = [];
    let pending = 1;

    function done(err) {
        if (err) {
            return cb(err);
        }

        if (--pending === 0) {
            return cb(null, fileList);
        }
    }

    function processPath(path) {
        fs.readdir(path, (err, files) => {
            if (err) {
                return done(err);
            }

            pending += files.length;
            done();

            for (const file of files) {
                const currPath = join(path, file);

                fs.stat(currPath, (err, stats) => {
                    if (err) {
                        return done(err);
                    }

                    if (stats.isDirectory()) {
                        return processPath(currPath);
                    } else {
                        fileList.push(file);
                        done();
                    }
                });
            }
        });
    }

    processPath(path);
}

const path = process.argv[2];

if (!path || !isAbsolute(path)) {
    console.error(`Malformatted argument. You must pass an absolute path.
Usage: node index <absolute_path>`);
    process.exit(1);
}

scanDir(path, (err, data) => {
    if (err) {
        console.error(err);
    }

    if (data) {
        console.log({
            msg: "Finish scanning...",
            total: data.length,
            data,
        });
    }
});
