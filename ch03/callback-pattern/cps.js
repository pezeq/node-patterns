/**
 * Direct Style
 * Takes values as parameters and the result 
 * is returned with a `return` statement.
 */
function add(a, b) {
    return a + b;
}

const callback = (result) => console.log(`Result: ${result}`);

/**
 * Synchronous Continuation-Passing Style
 * Expects an additional argument: a `callback function`
 * Instead of explicit returning, it returns through the callback.
 */
function addCps (a, b, callback) {
    callback(a + b);
}

console.log("before addCps");
addCps(1, 2, callback);
console.log("after addCps");

console.log("=".repeat(40));

/**
 * Asynchronous Continuation-Passing Style
 * As soon as the async request is sent,
 * it returns passing the control back to
 * the event loop.
 * 
 * When the async task is completed,
 * the callback function is invoked.
 */
function addAsync(a, b, callback) {
    setTimeout(() => callback(a + b), 100);
}

console.log("before addAsync");
addAsync(1, 2, callback);
console.log("after addAsync");