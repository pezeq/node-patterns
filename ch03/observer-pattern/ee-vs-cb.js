import { EventEmitter } from "node:events";

function helloEvent() {
    const eventEmitter = new EventEmitter();
    setTimeout(() => eventEmitter.emit("complete", "hello event"), 100);
    return eventEmitter;
}

helloEvent().on("complete", message => console.log(message));

function helloCallback(callback) {
    setTimeout(() => callback(undefined, "hello callback"), 100);
}

helloCallback(((_err, message) => console.log(message)));