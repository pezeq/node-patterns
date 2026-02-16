import { readFile, writeFile } from "node:fs";
import { dirname } from "node:path";
import {
    exists,
    get,
    getPageLinks,
    recursiveMkdir,
    urlToFilename,
} from "./utils.js";

export function spider(url, maxDepth, cb) {
    const filename = urlToFilename(url);

    exists(filename, (err, alreadyExists) => {
        if (err) {
            return cb(err);
        }

        if (alreadyExists) {
            if (!filename.endsWith(".html")) {
                return cb();
            }

            return readFile(filename, "utf8", (err, fileContent) => {
                if (err) {
                    return cb(err);
                }

                return spiderLinks(url, fileContent, maxDepth, cb);
            });
        }

        download(url, filename, (err, fileContent) => {
            if (err) {
                return cb(err);
            }

            if (filename.endsWith(".html")) {
                return spiderLinks(
                    url,
                    fileContent.toString("utf8"),
                    maxDepth,
                    cb,
                );
            }

            return cb();
        });
    });
}

function spiderLinks(currentUrl, body, maxDepth, cb) {
    if (maxDepth === 0) {
        return process.nextTick(cb);
    }

    const links = getPageLinks(currentUrl, body);

    if (links.length === 0) {
        return process.nextTick(cb);
    }

    let completed = 0;
    let hasErrors = false;

    function done(err) {
        if (err) {
            hasErrors = true;
            return cb(err);
        }

        if (++completed === links.length && !hasErrors) {
            return cb();
        }
    }

    for (const link of links) {
        spider(link, maxDepth - 1, done);
    }
}

function download(url, filename, cb) {
    console.log(`Downloading ${url} into ${filename}`);

    get(url, (err, content) => {
        if (err) {
            return cb(err);
        }

        saveFile(filename, content, (err) => {
            if (err) {
                return cb(err);
            }

            cb(null, content);
        });
    });
}

function saveFile(filename, content, cb) {
    recursiveMkdir(dirname(filename), (err) => {
        if (err) {
            return cb(err);
        }

        writeFile(filename, content, cb);
    });
}
