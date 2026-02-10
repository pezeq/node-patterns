import { EventEmitter } from "node:events";

function ticker(ms, callback) {
    const eventEmitter = new EventEmitter();
    let tickCount = 0;
    const startTime = Date.now();

    function scheduleTick() {
        setTimeout(() => {
            const timeElapsed = Date.now() - startTime;

            if (ms > timeElapsed) {
                eventEmitter.emit("tick");
                tickCount++;
                scheduleTick();
            } else {
                callback(undefined, tickCount);
            }

        }, 50)
    }

    scheduleTick();
    return eventEmitter;
}

const myTicker = ticker(2000, (_err, data) => {
    console.log(`Total tick count: ${data}`)
});

myTicker.on("tick", () => console.log("Tick..."));
