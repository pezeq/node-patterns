import { recursiveFind } from "./recursive-find.js";
import { isAbsolute } from "node:path";

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

recursiveFind(path, keyword, (err, data) => {
    if (err) {
        console.error("Error:", err);
        process.exit(1);
    }

    if (data) {
        console.log("Found:", data);
        process.exit(1);
    }
});
