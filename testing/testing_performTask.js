function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms))}

const higher_prio = parseInt(priority) + 1;
const logger = create_logger('Tasker/log/performTask.txt');

var fct;
flash(fct);
eval(fct);

function normal() {
    logger('before normal');
    performTask('Slow Task', higher_prio);
    logger('after normal');
    exit();
}

async function await_normal() {
    logger('before await_normal');
    await performTask('Slow Task', higher_prio);
    logger('after await_normal');
    exit();
}

async function launch() {
    logger('before launch');
    launch_task('Slow Task');
    logger('after launch');
    exit();
}

async function await_launch() {
    logger('before await_launch');
    await launch_task('Slow Task');
    logger('after await_launch');
    exit();
}



async function launch_task(task_name) {
    logger('launching: ' + task_name)
    
    performTask(task_name, higher_prio);
    while (global('TRUN').includes(task_name)) {await sleep(100)}

    logger('finishing: ' + task_name)
}


function create_logger(path) {
    writeFile(path, '', false);
    return function(msg) {
        var date = new Date(); 
        let hours = '0' + date.getHours();
        let min = '0' + date.getMinutes();
        let sec = '0' + date.getSeconds();
        let ms = '00' + date.getMilliseconds();
        let time = hours.substr(-2) + ":" 
                 + min.substr(-2) + ":" 
                 + sec.substr(-2) + ":" 
                 + ms.substr(-3);
        writeFile(path, `${time}    ${msg}\n`, true);
    }
}