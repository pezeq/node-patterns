import { EventEmitter } from "node:events";
import { get } from "node:http";

function download(url, cb) {
    const eventEmitter = new EventEmitter();

    const req = get(url, (res) => {
        const chunks = [];
        let downloadedBytes = 0;
        const fileSize = Number.parseInt(res.headers["content-length"], 10);

        res
            .on("error", (err) => {
                cb(err)
            })
            .on("data", (chunk) => {
                chunks.push(chunk);
                downloadedBytes += chunk.length;
                eventEmitter.emit("progress", downloadedBytes, fileSize);
            })
            .on("end", () => {
                const data = Buffer.concat(chunks);
                cb(undefined, data);
            });
    });

    req.on("error", (err) => {
        cb(err);
    });

    return eventEmitter;
}

download("http://localhost:3000/test.zip", (err, data) => {
    if (err) {
        return console.error(`Download failed: ${err.message}`);
    }

    console.log("Download completed", data);
}).on("progress", (downloaded, total) => {
    console.log(
        `${downloaded}/${total} (${((downloaded / total) * 100).toFixed(2)}%)`
    );
});