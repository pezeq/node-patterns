import { EventEmitter } from "node:events";
import { readFile, readFileSync } from "node:fs";

class FindRegex extends EventEmitter {
    constructor(regex) {
        super();
        this.regex = regex;
        this.files = [];
    }

    static create(regex) {
        return new FindRegex(regex);
    }

    addFile(file) {
        this.files.push(file);
        return this;
    }

    findAsync() {
        for (const file of this.files) {
            readFile(file, "utf-8", (err, content) => {
                if (err) {
                    return this.emit("error", err);
                }

                this.emit("readfile", file);

                const match = content.match(this.regex);

                if (match) {
                    for (const elem of match) {
                        this.emit("found", file, elem);
                    }
                }
            })
        }

        return this;
    }

    findSync() {
        for (const file of this.files) {
            let content;

            try {
                content = readFileSync(file, "utf-8");
            } catch (err) {
                this.emit("error", err);
            }

            this.emit("fileread", file);

            const match = content.match(this.regex);

            if (match) {
                for (const elem of match) {
                    this.emit("found", file, elem);
                }
            }
        }

        return this;
    }
}

const findRegexAsync = FindRegex
    .create(/hello [\w.]+/)
    .addFile("../fileA.txt")
    .addFile("../fileB.json")
    .findAsync()
    .on("found", (file, match) => console.log(`[Async] Match "${match}" found on ${file}`))
    .on("error", (err) => console.log(`[Async] Error reading ${file}: ${err.message}`))


const findRegexSync = FindRegex
    .create(/hello [\w.]+/)
    .addFile("../fileA.txt")
    .addFile("../fileB.json")
    .on("found", (file, match) => console.log(`[Before][Sync] Match "${match}" found on ${file}`))
    .findSync()
    .on("found", (file, match) => console.log(`[After][Sync] Match "${match}" found on ${file}`))
