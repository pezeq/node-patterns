const tasks = [
    (cb) => {
        console.log("Starting task 1");
        setTimeout(cb, 1000);
    },
    (cb) => {
        console.log("Starting task 2");
        setTimeout(cb, 1000);
    },
    (cb) => {
        console.log("Starting task 3");
        setTimeout(cb, 1000);
    },
];

function iterateSeries(collection, iteratorCallback, finalCallback) {
    function iterate(index) {
        if (index === collection.length) {
            return finalCallback();
        }

        const item = collection[index];

        item(() => {
            iteratorCallback(index, item);
            iterate(index + 1);
        });
    }

    iterate(0);
}

iterateSeries(
    tasks,
    (index) => console.log(`Finished task ${index + 1}`),
    () => console.log("Iteration Complete!"),
);
