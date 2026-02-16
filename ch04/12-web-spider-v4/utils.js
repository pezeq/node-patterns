import { Parser } from "htmlparser2";
import { mkdirp } from "mkdirp";
import { access, constants } from "node:fs";
import { extname, join } from "node:path";
import slug from "slug";

export function exists(filePath, cb) {
    access(filePath, constants.F_OK, (err) => {
        if (err) {
            if (err.code === "ENOENT") {
                return cb(null, false);
            }

            return cb(err);
        }

        return cb(null, true);
    });
}

export function urlToFilename(url) {
    const parsedUrl = new URL(url);
    const urlComponents = parsedUrl.pathname.split("/");
    const originalFileName = urlComponents.pop();
    const urlPath = urlComponents
        .filter((component) => component !== "")
        .map((component) => slug(component, { remove: null }))
        .join("/");
    const basePath = join(parsedUrl.hostname, urlPath);
    const missingExtension =
        !originalFileName || extname(originalFileName) === "";
    if (missingExtension) {
        return join(basePath, originalFileName, "index.html");
    }

    return join(basePath, originalFileName);
}

export function get(url, cb) {
    fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(
                    `Failed to fetch ${url}: ${response.statusText}`,
                );
            }
            return response.arrayBuffer();
        })
        .then((content) => cb(null, Buffer.from(content)))
        .catch((err) => cb(err));
}

export function recursiveMkdir(path, cb) {
    mkdirp(path)
        .then(() => cb(null))
        .catch((e) => cb(e));
}

export function getPageLinks(currentUrl, body) {
    const url = new URL(currentUrl);
    const internalLinks = [];

    const parser = new Parser({
        onopentag(name, attribs) {
            if (name === "a" && attribs.href) {
                const newUrl = new URL(attribs.href, url);
                if (
                    newUrl.hostname === url.hostname &&
                    newUrl.pathname !== url.pathname
                ) {
                    internalLinks.push(newUrl.toString());
                }
            }
        },
    });

    parser.end(body);

    return internalLinks;
}
