import { readFile } from "node:fs";
import { readFileSync } from "node:fs";

/**
 * Mixed Async/Sync
 */
const cache = new Map();

function inconsistentRead(filename, callback) {
    if (cache.has(filename)) {
        callback(cache.get(filename));
    } else {
        readFile(filename, "utf-8", (_err, data) => {
            cache.set(filename, data);
            callback(data);
        });
    }
}

function createFileReader(filename) {
    const listeners = [];

    inconsistentRead(filename, (value) => {
        for (const listener of listeners) {
            listener(value);
        }
    });

    return {
        onDataReady: (listener) => {
            return listeners.push(listener)
        },
    }
}

/**
 * Full Sync
 */
const cacheSync = new Map();

function consistentReadSync(filename) {
    if (cacheSync.has(filename)) {
        return cacheSync.get(filename);
    }

    const data = readFileSync(filename, "utf-8");
    cacheSync.set(filename, data);
    return data;
}

function createFileReaderSync(filename) {
    const listeners = [];
    const data = consistentReadSync(filename);

    return {
        onDataReady: (listener) => {
            listeners.push(listener)

            for (const listener of listeners) {
                listener(data);
            };
        },
    }
}

/**
 * Full Async
 */

const cacheAsync = new Map();

function consistentReadAsync(filename, callback) {
    if (cacheAsync.has(filename)) {
        process.nextTick(() =>
            callback(cacheAsync.get(filename))
        );
    } else {
        readFile(filename, "utf-8", (_err, data) => {
            cacheAsync.set(filename, data);
            callback(data);
        })
    }
}

function createFileReaderAsync(filename) {
    const listeners = [];

    consistentReadAsync(filename, (value) => {
        for (const listener of listeners) {
            listener(value);
        }
    });

    return {
        onDataReady: (listener) => {
            return listeners.push(listener)
        },
    }
}


/**
 * Testing
 */
const reader1 = createFileReaderAsync("data.txt");
reader1.onDataReady(data => {
    console.log(`First call data: ${data}`)

    const reader2 = createFileReaderAsync("data.txt");
    reader2.onDataReady(data => {
        console.log(`Second call data: ${data}`)
    })
})