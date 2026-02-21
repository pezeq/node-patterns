import { recursiveFind } from "./recursive-find.js";
import { isAbsolute } from "node:path";
import { TaskQueue } from "./TaskQueue.js";

let [, , path, keyword] = process.argv;

if (!path || !isAbsolute(path)) {
    console.error(`Malformatted argument. You should pass an absolute path.
Usage: node index <path> <keyword>`);
    process.exit(1);
}

if (!keyword) {
    console.error(`Malformatted argument. You should pass a keyword.
Usage: node index <path> <keyword>`);
    process.exit(1);
}

if (Array.isArray(keyword)) {
    keyword = keyword.join(" ").trim();
}

const queue = new TaskQueue();

queue
    .on("empty", (list) => console.log(`\nFound ${list.length} files with "${keyword}":`, list))
    .on("error", (err) => console.error("Error:", err));

recursiveFind(path, keyword, queue);
