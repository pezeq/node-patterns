import { EventEmitter } from "node:events";

function ticker(ms, callback) {
    const eventEmitter = new EventEmitter();
    let tickCount = 0;
    const startTime = Date.now();

    process.nextTick(() => {
        if (startTime % 5 === 0) {
            eventEmitter.emit("error");
            callback(new Error(`Start time '${startTime}' moment is divisible by 5`));
            return;
        }

        eventEmitter.emit("tick");
        tickCount++;
        scheduleTick();
    });

    function scheduleTick() {
        setTimeout(() => {
            const now = Date.now();
            const timeElapsed = now - startTime;

            if (now % 5 === 0) {
                eventEmitter.emit("error");
                callback(new Error(`Now '${now}' moment is divisible by 5`));
                return;
            }

            if (ms > timeElapsed) {
                eventEmitter.emit("tick");
                tickCount++;
                scheduleTick();
            } else {
                callback(undefined, tickCount);
            }
        }, 50)
    }

    return eventEmitter;
}

const myTicker = ticker(2000, (err, data) => {
    if (err) {
        return console.error(err.message);
    }

    console.log(`Total tick count: ${data}`)
});

myTicker.on("tick", () => console.log("Tick..."));
myTicker.on("error", () => console.error("[!!!] Error..."));