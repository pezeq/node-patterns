import { FindRegex } from "./FindRegex.js";

const findRegex = FindRegex
    .create(/hello [\w.]+/)
    .addFile("../../fileA.txt")
    .addFile("../../fileB.json")
    .find()
    .on("start", (files) => console.log("Start searching for regex in files:", files))
    .on("readfile", (file) => console.log("Reading file:", file))
    .on("found", (file, match) => console.log(`Found match "${match}" in file: ${file}`))
    .on("error", (err) => console.err("Error reading file", err.message));