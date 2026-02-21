import { brokenLinkChecker } from "./broken-link-checker.js";
import { TaskQueue } from "./TaskQueue.js";

const [, , url, maxDepth] = process.argv;

function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch (err) {
        return false;
    }
}

if (!url || !isValidURL(url)) {
    console.error(`Malformatted argument. You should pass a valid URL.
Usage: node index <https://www.example.com> <maxDepth>`);
    process.exit(1);
}

if (!maxDepth) {
    console.error(`Malformatted argument. You should pass a max depth.
Usage: node index <https://www.example.com> <maxDepth>`);
    process.exit(1);
}

const queue = new TaskQueue();
queue
    .on("empty", (links) => {
        console.log("=".repeat(64));
        console.log("Search completed!");
        console.log("Total broken links found:", links.length);
        console.log("Links:", links);
        console.log("=".repeat(64));
    })
    .on("error", (err) => {
        console.log("=".repeat(64));
        console.error("Error while crawling:", err.message);
        console.log("=".repeat(64));
    });

brokenLinkChecker(url, maxDepth, queue);
