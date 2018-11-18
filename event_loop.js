function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms))}

// const { performance } = require('perf_hooks');
// let test_queue = 'wait,wait_async'
// function flash(msg) {console.log(msg)}
// function flashLong(msg) {console.log(msg)}
// function exit(){console.log('exit()')}
// function global(a1){return test_queue}
// function setGlobal(a1,a2){if (a1 == 'JS_queue') {test_queue = ''}}
// function writeFile(a1,a2,a3){console.log(a2);}
// function performTask(a1,a2,a3,a4){return true;}
// function enableProfile(a1,a2){return true;}
// debugging = 1;

/* ################ Functions ################ */
//#region Functions

//#region Notifications
async function remove_notifications() {
    var snooze_time;
    let Snooze_time = parseInt(global('Snooze_time'));
    let TIMES = parseInt(global('TIMES'));
    let Disengaged_until = parseInt(global('Disengaged_until'));
    let Disengaged = (global('Disengaged') === 'true');

    if (Disengaged || Snooze_time > TIMES) {
        if (Disengaged_until > TIMES) {
            snooze_time = (Disengaged_until + 60 - TIMES) * 1000;
        } else if (Disengaged) {
            snooze_time = 1800 * 1000;
        } else {
            snooze_time = (Snooze_time + 5 - TIMES) * 1000;
        }

        let packages = global('All_notification_packages').split(',');
        for (const i in packages) {
            let app = packages[i];
            performTask('remove_notification', priority, app, snooze_time);
        }
    } else if (!Disengaged) {
        let Blocked_apps = global('Blocked_apps');
        let Blocked_times = global('Blocked_times')
        for (i in Blocked_apps) {
            if (Blocked_times[i] > TIMES) {
                let app = Blocked_apps[i];
                performTask('remove_notification', priority, app, snooze_time)
            }
        }
    }
}
//#endregion

//#region Testing
function wait() {
    return new Promise(resolve => {
        sleep(10000).then(() => {flash('synced'); resolve()})
    });
}

async function wait_async() {
    await sleep(10000)
    flash('async')
}

async function example_task(){
    flash('example_task');
    return 'example_task done'
}

async function example_async_loop(){
    let t0 = performance.now()
    while (true){
        
        let elapsed = parseInt(performance.now() - t0) / 1000;
        flash('while loop: ' + elapsed);
        await sleep(3000);
        if (elapsed > 15) {break}

    }
    return 'while loop done'
}

async function timer () {
    let i = 0;
    while (i < 10) {
    
        launch_task('create_notification', 5,
                    `Timer|${i}|mw_image_timer|3`);
        i++;
        await sleep(1000);
    }
}
//#endregion Testing

async function pomodoro() {
    try {
        disengage();
        // let TIMES = 0
        // let Disengaged_until = 200
        let TIMES = parseInt(global('TIMES'));
        let Disengaged_until = TIMES + 1200
        setGlobal('Disengaged_until', Disengaged_until);
        enableProfile('Engage', true);
        
        while (Disengaged_until > TIMES) {
            TIMES = parseInt(global('TIMES'));

            let time_left_min = Math.floor((Disengaged_until - TIMES) / 60);
            let time_left_sec = (Disengaged_until - TIMES) % 60;
            time_left_min = pad(String(time_left_min), 2);
            time_left_sec = pad(String(time_left_sec), 2);

            // flash(time_left_min + ':' + time_left_sec);

            performTask('create_notification', parseInt(priority) + 1,
                        `Pomodoro Session|${time_left_min}:${time_left_sec} remaining|mw_image_timer|3`);
            await sleep(500);
        }
    } catch(error) {
        flashLong('pomodoro error')
        writeFile('Tasker/log/pomodoro.txt', error + '\n\n', true)
    }
}

//#region disengage
async function disengage() {
    if (global('Indoor') == 1) {
        setGlobal('Disengaged', true);
        performTask('Remove Notifications');
        shell('settings put secure accessibility_display_daltonizer_enabled 1', true);
        enableProfile('Wake Up', true);
        // setWifi(false);
        // mobileData(false);
    }
}
async function engage() {
    setGlobal('Disengaged', false);
    enableProfile('Engage', false);
    shell('settings put secure accessibility_display_daltonizer_enabled 0', true);
    performTask('regular_checks')
    // setWifi(true);
    // mobileData(true);
}
//#endregion

//#endregion #### functions ####

/* ################ Event Loop ################ */
async function event_loop(){
    setGlobal('JS_running', 'true');
    debugging = parseInt(global('Debugging'));
    
    // if (debugging) {flash()}
    let promise_list = []; // running fns
    let once = true;
        
    while (true) {
        let queue_str = global('JS_queue');
        setGlobal('JS_queue', '');
        
        if (queue_str) {
            let queue = queue_str.split(',');

            if (debugging) {flash('Queue String: ' + queue_str + '\nQueue length: ' + queue.length)}

            promise_list = launch_functions(queue, promise_list);
            
        } else { 
            // if (debugging) {flash(promise_list)}
            let should_break = check_running(promise_list);
            if (should_break) {break}
        }
        await sleep(200);
    }    
    exiting();
}


/* ################ Helpers ################ */
//#region
async function launch_task(task_name) {
    // if (debugging) {flash('Starting: ' + task_name)}
    
    performTask(task_name);
    while (global('TRUN').includes(task_name)) {await sleep(100)}

    if (debugging) {flash('Finished: ' + task_name)}
}

function launch_functions(queue, promise_list) {
    for (i in queue) {
        let fn = queue[i];
        if (fn) {
            try {
                let promise = eval(fn + '()');

                promise = extend_promise(promise);
                promise_list.push(promise);

            } catch(error) {
                flashLong('launch_functions error')
                writeFile('Tasker/log/launch_functions_error.txt', fn + '\n' + error + '\n\n', true)
            }
        }
    }
    return promise_list
}

function extend_promise(promise) {
    if (promise.is_pending) return promise;

    let is_pending = true;

    let result = promise.then(
        function(v) {
            is_pending = false;
            return v; 
        }, 
        function(e) {
            is_pending = false;
            throw e; 
        }
    );

    result.is_pending = function() { return is_pending; };
    return result;
}
function check_running(promise_list) {
    let should_break = true;
    for (i in promise_list) {
        let promise = promise_list[i];
        let pending = promise.is_pending();
        // console.log('function: ' + promise_list[i][0], pending);
        if (pending) {should_break = false}
    }
    return should_break
}
async function exiting() {
    if (debugging) {flash('Exiting Event Loop.')}
    setGlobal('JS_running', 'false');
    exit();
}
function pad(n, padding) {
    n = String(n);
    return n.length >= padding ? n : new Array(padding - n.length + 1).join('0') + n;
};
//#endregion


event_loop()
