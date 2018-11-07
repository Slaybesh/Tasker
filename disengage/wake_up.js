function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms))}
async function launch_task(task_name) {
    // if (debugging) {flash('Starting: ' + task_name)}
    
    performTask(task_name);
    while (global('TRUN').includes(task_name)) {await sleep(100)}
    
    if (debugging) {flash('Finished: ' + task_name)}
}
async function wake_up() {
    
    let start_time = global('TIMES');

    launch_task('Show Wake Up Dialog');
    if (parseInt(global('Wake_up'))) {
        setGlobal('Disengaged_until', start_time + 7200);
        setGlobal('Wake_up', 0);
        enableProfile('engage', true);
        enableProfile('WakeUp', true);

        exit()
    }
    
    while (global('SCREEN') == 'on') {
        let curr_time = global('TIMES');
        // flash(curr_time - start_time);
        await sleep(5000);
        if (curr_time - start_time > 60) {
            // flashLong('break');
            setGlobal('Disengaged_until', curr_time + 7200);
            exit()
        }
    }
    exit();
}
wake_up()