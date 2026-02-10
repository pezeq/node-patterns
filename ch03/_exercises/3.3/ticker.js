import { EventEmitter } from "node:events";

function ticker(ms, callback) {
    const eventEmitter = new EventEmitter();

    let tickCount = 0;
    const startTime = Date.now();
    let timeElapsed = startTime;
    const maximumTime = startTime + ms;

    function timer() {
        eventEmitter.emit("tick");

        if (maximumTime > timeElapsed) {
            timeElapsed += 50;
            tickCount++;
            setTimeout(timer, 50);
        } else {
            callback(undefined, tickCount);
        }
    }
    
    setTimeout(timer, 50);
    return eventEmitter;
}

const myTicker = ticker(2000, (_err, data) => {
    console.log(`Total tick count: ${data}`)
});

myTicker.on("tick", () => console.log("Tick..."));
