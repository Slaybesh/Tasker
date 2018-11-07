const { performance } = require('perf_hooks');

function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms))}
function flash(msg) {console.log(msg)}
function exit(){console.log('exit()')}

async function task1(){
    return new Promise(resolve => {
        flash('task1');
        resolve('task1 done');
    });
}
async function task2(){
    return new Promise(resolve => {
        flash('task2');
        resolve('task2 done');
    });
}
async function async_long_task(){
    return new Promise(async function (resolve) {
        flash('beginning long task');
        await sleep(3000);
        flash('finishing long task');
        resolve('long_task done');
    });
}

async function long_task(){
    return new Promise(async function (resolve) {
        flash('beginning long task');
        setTimeout(function () {flash('finishing long task')}, 3000)
        resolve('long_task done');
    });
}

async function for_loop_task(){
    return new Promise(async function (resolve) {
        console.log('start for_loop_task');
        for (i=0; i<4; i++){
            console.log('for loop: ' + i);
            await sleep(500);
        }
        resolve('for loop done');
    });
}

async function while_loop_task(){
    return new Promise(async function (resolve) {
        let t0 = performance.now()
        while (true){
            
            let elapsed = parseInt(performance.now() - t0) / 1000;
            console.log('while loop: ' + elapsed);
            await sleep(1000);
            if (elapsed > 3) {break}

        }
        resolve('while loop done');
    });
}

// var fn = [loop(), long_task(), task1()]
// Promise.all(fn).then((message) => console.log(message));
// flash(fn)


function MakeQuerablePromise(promise) {
    // Don't modify any promise that has been already modified.
    if (promise.isPending) return promise;

    // Set initial state
    let isPending = true;
    let isFulfilled = false;
    let isRejected = false;

    // Observe the promise, saving the fulfillment in a closure scope.
    let result = promise.then(
        function(v) {
            isPending = false;
            isFulfilled = true;
            return v; 
        }, 
        function(e) {
            isPending = false;
            isRejected = true;
            throw e; 
        }
    );

    result.isPending = function() { return isPending; };
    result.isFulfilled = function() { return isFulfilled; };
    result.isRejected = function() { return isRejected; };
    return result;
}


function isPending(promise) {
    // Don't modify any promise that has been already modified.
    if (promise.isPending) return promise;

    // Set initial state
    let isPending = true;

    // Observe the promise, saving the fulfillment in a closure scope.
    let result = promise.then(
        function(v) {
            isPending = false;
            return v; 
        }, 
        function(e) {
            isPending = false;
            throw e; 
        }
    );

    result.isPending = function() { return isPending; };
    return result;
}

function check_running(promise_list) {
    let should_break = true;
    for (i in promise_list) {
        let promise = promise_list[i][1];
        let pending = promise.isPending();
        // console.log('function: ' + promise_list[i][0], pending);
        if (pending) {should_break = false}
    }
    return should_break
}

async function event_loop(){
    // setGlobal('JS_running', 'true')
    let queue_str = 'task1,long_task,while_loop_task';
    // let queue_str = 'while_loop_task';
    let promise_list = []; // running fns
    let once = true;
        
    while (true) {
        // let queue_str = global('JS_queue')
        if (queue_str) {
            // let queue = global('JS_queue').split(',')
            // setGlobal('JS_queue', '')
            let queue = queue_str.split(','); // convert string to list
            queue_str = '';

            for (i in queue) {
                let fn = queue[i];

                // console.log('launching ' + fn)
                try {
                    let promise = eval(fn + '()');
    
                    promise = isPending(promise);
                    promise_list.push([fn, promise]);

                } catch(error) {

                }
                // console.log('promise_list ' + promise_list)

            }
            
        } else { 
            let should_break = check_running(promise_list);
            if (once) {
                queue_str = 'task2,while_loop_task,long_task';
                once = false;
            }
            // console.log('should_break: ', should_break)
            if (should_break) {break}
        }
        await sleep(200);
    }
    // setGlobal('JS_running', 'false')
    exit();
}

async function for_loop() {
    let t0 = performance.now();
    let promise_list = [];

    let promise = while_loop_task()
    promise = isPending(promise)
    promise_list.push(promise);

    whileloop:
    while (true) {
        for (i in promise_list) {
            let promise = promise_list[i];
            promise.then((value) => {console.log(value)});

            if (!promise.isPending()) {
                console.log(promise.isPending());
                let t1 = performance.now();
                console.log('time taken: ' + parseInt(t1 - t0));
                break whileloop;
            }
        }
        await sleep(1000)
    }
}

async function promise_test() {
    let promise = loop();
    
    promise = is_pending(promise);
    let t0 = performance.now();
    while (true){
        let pending = promise.isPending();
        // console.log(pending)
        
        if (!pending) {
            console.log('breaking');
            // console.log(promise.isResolved);
            console.log('time taken: ' + parseInt(performance.now() - t0));
            break;
        }
        await sleep(200)
    }
}



event_loop()
