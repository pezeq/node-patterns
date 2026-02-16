import { readFile, writeFile } from "node:fs";
import { dirname } from "node:path";
import {
    exists,
    get,
    getPageLinks,
    recursiveMkdir,
    urlToFilename,
} from "./utils.js";

function spiderTask(url, maxDepth, queue, cb) {
    const filename = urlToFilename(url);

    exists(filename, (err, alreadyExists) => {
        if (err) {
            return cb({
                msg: "Error while running `exists` function",
                filename,
                err,
            });
        }

        if (alreadyExists) {
            if (!filename.endsWith(".html")) {
                return cb({
                    msg: "File is not a html file",
                    filename,
                    err,
                });
            }

            return readFile(filename, "utf8", (err, fileContent) => {
                if (err) {
                    return cb({
                        msg: "Not able to read file",
                        filename,
                        err,
                    });
                }

                spiderLinks(url, fileContent, maxDepth, queue);

                return cb();
            });
        }

        download(url, filename, (err, fileContent) => {
            if (err) {
                return cb({
                    msg: `Was not able to download "${filename}"`,
                    url,
                    err,
                });
            }

            if (filename.endsWith(".html")) {
                spiderLinks(url, fileContent.toString("utf8"), maxDepth, queue);

                return cb();
            }

            return cb();
        });
    });
}

function spiderLinks(currentUrl, body, maxDepth, queue) {
    if (maxDepth === 0) {
        return;
    }

    const links = getPageLinks(currentUrl, body);

    if (links.length === 0) {
        return;
    }

    for (const link of links) {
        spider(link, maxDepth - 1, queue);
    }
}

const spidering = new Set();
export function spider(url, maxDepth, queue) {
    if (spidering.has(url)) {
        return;
    }
    spidering.add(url);

    queue.pushTask((done) => {
        spiderTask(url, maxDepth, queue, done);
    });
}

function download(url, filename, cb) {
    console.log(`Downloading ${url} into ${filename}`);

    get(url, (err, content) => {
        if (err) {
            return cb({
                msg: "Error while fetching url",
                url,
                err,
            });
        }

        saveFile(filename, content, (err) => {
            if (err) {
                return cb({
                    msg: "Error saving file",
                    filename,
                    err,
                });
            }

            cb(null, content);
        });
    });
}

function saveFile(filename, content, cb) {
    recursiveMkdir(dirname(filename), (err) => {
        if (err) {
            return cb({
                msg: "Error making directory",
                filename,
                err,
            });
        }

        writeFile(filename, content, cb);
    });
}
