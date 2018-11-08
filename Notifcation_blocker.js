async function notification_blocker() {
    let logger = create_logger('main')
    logger('start')
    let TIMES = parseInt(global('TIMES'));
    
    let await_disengaged = disengaged_apps()
    let await_limited = limited_apps()
    let await_pomo = pomo_apps()

    await await_disengaged;
    await await_limited;
    await await_pomo;
    exit()

    
    
    async function disengaged_apps() {
        let snooze_time;
        let Disengaged = parseInt(global('Disengaged'));
        let Disengaged_until = parseInt(global('Disengaged_until'));
        let Apps_disengage = JSON.parse(global('Apps_disengage'));
        
        if (Disengaged) {
            logger('disengaged')
            /* depending on time of day, calc snooze time */
            if (Disengaged_until > TIMES) {
                snooze_time = (Disengaged_until + 60 - TIMES) * 1000;
            } else {
                snooze_time = 1800 * 1000; /* 30 min */
            }

            /* snoozing apps loop */
            for (i in Apps_disengage) {
                launch_task('Notification.snooze', Apps_disengage[i], snooze_time)
            }
        }
    }

    async function pomo_apps() {
        let snooze_time;
        let Pomo = parseInt(global('Pomo'));
        let Pomo_until = parseInt(global('Pomo_until'));
        let Apps_pomo = JSON.parse(global('Apps_pomo'));

        if (Pomo) {
            logger('pomo')
            snooze_time = (Pomo_until + 5 - TIMES) * 1000
            for (i in Apps_pomo) {
                launch_task('Notification.snooze', Apps_pomo[i], snooze_time)
            }
        }
    }
    
    async function limited_apps() {
        let snooze_time;
        let Apps_limit = JSON.parse(global('Apps_limit'));
        let package_var;
        let app_json;

        for (i in Apps_limit) {
            logger('limiter')
            package_var = Apps_limit[i].replace(/\./g, '_');
            package_var = package_var.charAt(0).toUpperCase() + package_var.slice(1);
            app_json = JSON.parse(global(package_var));
            snooze_time = (app_json.blocked_until + - TIMES) * 1000;
            launch_task('Notification.snooze', Apps_limit[i], snooze_time)
        }
        logger('end')
    }
}

const create_logger = logging('Tasker/log/notification_blocker.txt', true)
notification_blocker()

/* ######################################################################### */
/* ################################ helpers ################################ */
/* ######################################################################### */
//#region
function launch_task(task_name, par1, par2, ...parameters) {

    let logger = create_logger('launch_task')
    let new_par1;
    let new_par2;
    
    if (parameters.length > 0) {
        new_par1 = `${par1}|${par2}`;
        for (i in parameters) {new_par1 += `|${parameters[i]}`}
    } else {
        new_par1 = par1;
        new_par2 = par2;
    }

    logger(task_name, new_par1, new_par2, parameters)
    performTask(task_name, parseInt(priority) + 1, new_par1, new_par2)
}

function logging(path, global_debugging=true) {

    writeFile(path, '', false);
    return function create_logger(name, debugging=true) {
        return function(...input_msg) {
            if (debugging && global_debugging) {
                var date = new Date(); 
                let hours = '0' + date.getHours();
                let min = '0' + date.getMinutes();
                let sec = '0' + date.getSeconds();
                let ms = '00' + date.getMilliseconds();
                let time = hours.substr(-2) + ":" 
                         + min.substr(-2) + ":" 
                         + sec.substr(-2) + ":" 
                         + ms.substr(-3);
                    
                let msg = '';
                for (i in input_msg) {
                    msg += ` ${input_msg[i]}`
                }
                writeFile(path, `${time}:    ${name}:    ${msg}\n`, true);
            }
        }
    }
}
//#endregion
