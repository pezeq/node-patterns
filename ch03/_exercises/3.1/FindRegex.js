import { EventEmitter } from "node:events";
import { readFile } from "node:fs";

export class FindRegex extends EventEmitter {
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
    
    find() {
        process.nextTick(() => this.emit("start", this.files));

        for (const file of this.files) {
            readFile(file, "utf-8", (err, data) => {
                if (err) {
                    this.emit("error", err);
                }

                this.emit("readfile", file);

                const match = data.match(this.regex);

                if (match) {
                    for (const elem of match) {
                        this.emit("found", file, elem);
                    }
                }
            });
        }

        return this;
    }
}