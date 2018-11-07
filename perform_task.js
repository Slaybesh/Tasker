function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms))}

async function launch_task(task_name) {
    flash('Starting: ' + task_name);
    performTask(task_name);
    while (global('TRUN').includes(task_name)) {
        await sleep(100);
    }
    flash('Finished: ' + task_name);
    exit();
}

launch_task(some_task)