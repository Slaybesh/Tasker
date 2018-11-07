const { performance } = require('perf_hooks');
function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms))}


async function async_long_task(){
    console.log('beginning long task');
    await sleep(1000);
    console.log('finishing long task');
    throw 'long_task done';
}

async function task1(){
    console.log('task1');
    return 'task1 done'
}

let promise = async_long_task();
promise = extend_promise(promise);

// promise.then(resolve => console.log(resolve), 
//              reject => console.log(reject));

promise.then(resolve => console.log(resolve + '\n',
                promise.isPending() + '\n', 
                promise.isFulfilled() + '\n', 
                promise.isRejected() + '\n')
            ), reject => console.log(reject,
                promise.isPending() + '\n', 
                promise.isFulfilled() + '\n', 
                promise.isRejected() + '\n')

console.log(promise.isPending() + '\n', 
            promise.isFulfilled() + '\n', 
            promise.isRejected() + '\n')


function extend_promise(promise) {
    // Don't modify any promise that has been already modified.
    if (promise.isPending) return promise;

    // Set initial state
    let isPending = true;
    let isFulfilled = false;
    let isRejected = false;

    // Observe the promise, saving the fulfillment in a closure scope.
    let result = promise.then(
        resolve => {
            isPending = false;
            isFulfilled = true;
            return resolve; 
        }, 
        reject => {
            isPending = false;
            isRejected = true;
            return reject; 
        }
    );

    result.isPending = function() { return isPending; };
    result.isFulfilled = function() { return isFulfilled; };
    result.isRejected = function() { return isRejected; };
    return result;
}

