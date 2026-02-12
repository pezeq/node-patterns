import { readdir, stat } from "node:fs";
import { fileURLToPath } from "node:url";
import * as path from "node:path";
import { EventEmitter } from "node:events";

function diskBloatFinder(__dirname) {
    const event = new EventEmitter();

    let largestFile = { name: "", size: 0, path: "" };
    let pendingOps = 0;
    let totalFilesProcessed = 0;
    let totalErrors = 0;

    const startTime = Date.now();

    function checkComplete() {
        if (pendingOps === 0) {
            const endTime = Date.now();
            event.emit(
                "over",
                largestFile,
                totalFilesProcessed,
                totalErrors,
                startTime,
                endTime
            );
        }
    }

    function scanDir(dirPath) {
        pendingOps++;

        readdir(dirPath, (err, files) => {
            if (err) {
                event.emit("error", { error: err, path: dirPath });
                pendingOps--;
                totalErrors++;
                checkComplete();
                return;
            }

            event.emit("loadFiles", {
                path: dirPath,
                files,
            });

            if (files.length === 0) {
                pendingOps--;
                checkComplete();
                return;
            }

            let filesProcessed = 0;

            for (const file of files) {
                const currPath = path.join(dirPath, file);

                stat(currPath, (err, stats) => {
                    if (err) {
                        event.emit("error", { error: err, path: dirPath });
                        filesProcessed++;
                        totalFilesProcessed += filesProcessed;
                        totalErrors++;

                        if (filesProcessed === files.length) {
                            pendingOps--;
                            checkComplete();
                        }

                        return;
                    }

                    const isDirectory = stats.isDirectory();

                    event.emit("read", {
                        path: currPath,
                        isDirectory,
                        stats,
                    });

                    if (isDirectory) {
                        event.emit("subfolder", path.basename(currPath));
                        scanDir(currPath);
                    } else {
                        const fileName = path.basename(currPath);
                        const { size } = stats;

                        event.emit("isFile", {
                            fileName,
                            size,
                        });

                        if (size > largestFile.size) {
                            largestFile.name = fileName;
                            largestFile.size = size;
                            largestFile.path = currPath;

                            event.emit("isLargest", {
                                fileName,
                                size,
                                path: currPath,
                            });
                        }
                    }

                    filesProcessed++;
                    totalFilesProcessed += filesProcessed;

                    if (filesProcessed === files.length) {
                        pendingOps--;
                        checkComplete();
                    }

                });
            }

        });
    }

    scanDir(__dirname);
    return event;
}

const __dirname = fileURLToPath(import.meta.resolve("../../../../.."));

diskBloatFinder(__dirname)
    .on("error", (err) => console.error("\n[ERROR]:", err))
    .on("loadFiles", (details) => console.log("\n[INFO] Files in directory:", details))
    .on("read", (details) => console.log("\n[INFO] Reading:", details))
    .on("isFile", (details) => console.log("\n[INFO] File:", details))
    .on("subfolder", (basename) => console.log("\n[INFO] Scanning subfolder:", basename))
    .on("isLargest", (details) => console.log("\n[INFO] New largest file:", details))
    .on("over", ({ name, size, path }, totalFilesProcessed, totalErrors, startTime, endTime) => {
        console.log("\n\n================= SCAN COMPLETE =================");
        console.log("Total Files Processed:\t", totalFilesProcessed);
        console.log("Total Errors:\t\t", totalErrors);
        console.log("Start Time:\t\t", new Date(startTime).toISOString());
        console.log("End Time:\t\t", new Date(endTime).toISOString());
        console.log("\nLargest file found:");
        console.log("Name:\t", name);
        console.log(`Size:\t ${size} bytes (${(size / 1024 / 1024).toFixed(2)} MB)`);
        console.log("Path:\t", path);
        console.log("=================================================");
    });