function queue_engaging() {
    setGlobal('Disengaged_until', curr_time + 7200);
    exit()
}

function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms))}

async function wake_up() {
    
    var start_time = global('TIMES');
    while (global('SCREEN') == 'on') {
        var curr_time = global('TIMES');
        // flash(curr_time - start_time);
        await sleep(2000);
        if (curr_time - start_time > 60) {
            // flashLong('break');
            setGlobal('Disengaged_until', curr_time + 7200);
            exit()
        }
    }
    exit();
}
wake_up();


function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms))}

async function screen_timer() {
    // vibrate(100);
    var start_time = global('TIMES');
    while (global('SCREEN') == 'on') {
        // vibrate(30);
        await sleep(200);
        if (global('SCREEN') == 'off') {
            vibrate(500);
            flashLong(global('TIMES') - start_time);
            exit();
        }
    }
}
screen_timer();
