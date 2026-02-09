import { readFile } from "node:fs";

function readJson(filename, callback) {
    readFile(filename, "utf-8", (err, data) => {
        if (err) {
            return callback(err);
        }

        let parsed;

        try {
            parsed = JSON.parse(data);
        } catch (err) {
            return callback(err);
        }

        return callback(undefined, parsed);
    })
}

function readJsonThrows(filename, callback) {
    readFile(filename, "utf-8", (err, data) => {
        if (err) {
            return callback(err);
        }

        return callback(undefined, JSON.parse(data));
    })
}

try {
    readJsonThrows("invalidJson.json", (err) => console.err(err))
} catch (err) {
    console.log("This will NOT catch the JSON parsing exception")
}

process.on("uncaughtException", (err) => {
    console.error("This will catch at least the JSON parsing excpetion:", err.message);
    process.exit(1);
})

readJsonThrows("invalidJson.json", (err, data) => {
    if (err) {
        console.log(err);
        process.exit(1);
    };

    console.log(JSON.stringify(data));
})