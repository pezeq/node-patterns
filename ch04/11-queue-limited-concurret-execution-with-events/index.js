import { TaskQueue } from "./TaskQueue.js";

const queue = new TaskQueue(2);

function makeSampleTask(name) {
    return (cb) => {
        console.log(`${name} started`);
        setTimeout(() => {
            console.log(`${name} completed`, queue.stats());
            cb();
        }, Math.random() * 2000);
    };
}

function task1(cb) {
    console.log("Task 1 started", queue.stats());
    queue
        .pushTask(makeSampleTask("task1 -> subtask1"))
        .pushTask(makeSampleTask("task1 -> subtask2"));

    setTimeout(() => {
        console.log("Task 1 completed", queue.stats());
        cb();
    }, Math.random() * 2000);
}

function task2(cb) {
    console.log("Task 2 started", queue.stats());
    queue
        .pushTask(makeSampleTask("task2 -> subtask1"))
        .pushTask(makeSampleTask("task2 -> subtask2"))
        .pushTask(makeSampleTask("task2 -> subtask3"));

    setTimeout(() => {
        console.log("Task 2 completed", queue.stats());
        cb();
    }, Math.random() * 2000);
}

queue
    .on("empty", () => console.log("Que is empty"))
    .on("error", (err) =>
        console.error("Error while running task:", err.message),
    )
    .pushTask(task1)
    .pushTask(task2);
