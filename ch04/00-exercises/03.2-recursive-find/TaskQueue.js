import EventEmitter from "node:events";

export class TaskQueue extends EventEmitter {
    constructor(concurrency = 2) {
        super();
        this.concurrency = concurrency;
        this.running = 0;

        this.queue = [];
        this.store = [];
    }

    pushTask(task) {
        this.queue.push(task);
        process.nextTick(this.next.bind(this));
        return this;
    }

    pushStore(item) {
        this.store.push(item);
        return this;
    }

    next() {
        if (this.running === 0 && this.queue.length === 0) {
            this.emit("empty", this.store);
        }

        while (this.running < this.concurrency && this.queue.length > 0) {
            const task = this.queue.shift();

            task((err) => {
                if (err) {
                    this.emit("error", err);
                }

                this.running--;
                process.nextTick(this.next.bind(this));
            });
            this.running++;
        }
    }
}
