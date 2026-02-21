import { Parser } from "htmlparser2";

const urlSet = new Set();
export function brokenLinkChecker(url, maxDepth, queue) {
    if (urlSet.has(url)) {
        return;
    }
    urlSet.add(url);

    console.log("Searching:", url);

    queue.pushTask((cb) => {
        checkerTask(url, maxDepth, queue, cb);
    });
}

function checkerTask(url, maxDepth, queue, cb) {
    getPageContent(url, maxDepth, (err, data) => {
        if (err) {
            return cb(err);
        }

        if (data === url) {
            queue.pushStore(url);
            return cb();
        }

        checkAllPageLinks(url, data, maxDepth, queue);
        return cb();
    });
}

function checkAllPageLinks(url, data, maxDepth, queue) {
    if (maxDepth === 0) {
        return;
    }

    const links = getPageLinks(url, data.toString("utf8"));

    if (links.length === 0) {
        return;
    }

    links.forEach((link) => {
        brokenLinkChecker(link, maxDepth - 1, queue);
    });
}

function getPageContent(url, maxDepth, cb) {
    const method = maxDepth === 0 ? "HEAD" : "GET";

    fetch(url, { method })
        .then((res) => {
            if (res.status === 404) {
                return cb(null, url);
            }

            if (!res.ok) {
                throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
            }

            return res.arrayBuffer().then((buf) => cb(null, Buffer.from(buf)));
        })
        .catch((err) => cb(err));
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
