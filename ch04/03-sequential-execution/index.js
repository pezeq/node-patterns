function asyncOperation(cb) {
    process.nextTick(cb);
}

function task1(cb) {
    console.log("task 1");
    asyncOperation(() => {
        task2(cb);
    });
}

function task2(cb) {
    console.log("task 2");
    asyncOperation(() => {
        task3(cb);
    });
}

function task3(cb) {
    console.log("task 3");
    cb();
}

task1(() => {
    console.log("tasks 1, 2 and 3 executed");
});
