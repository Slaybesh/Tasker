function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms))}


logger = create_logger('Tasker/log/regular_checks.txt');

async function regular_checks() {
    logger('start regular_checks')
    await roundr();
    shell('settings put secure enabled_accessibility_services ' + global('Accessibility_services'), true);
    // logger('shell input: ' + 'settings put secure enabled_accessibility_services' + global('Accessibility_services'))
    performTask('Zooper Disengaged');
    performTask('Zooper Reload Location');
    await remove_persistent();
    logger('end regular_checks')
    exit();
}

async function remove_persistent() {
    logger('start remove_persistent')
    let persistent_apps = JSON.parse(global('Apps_persistent'));
    for (i in persistent_apps) {
        logger(`Snooze app: ${persistent_apps[i]}`)
        performTask('Notification.snooze', 
            parseInt(priority) + 1, persistent_apps[i], '10000000000000');
    }
    logger('end remove_persistent')
}
async function roundr() {
    logger('start roundr')
    let id_roundr = shell("echo proc/$(pidof mohammad.adib.roundr) | cut -f 2 -d '/'", true);
    logger(`id_roundr: ${id_roundr}`)
    if (!id_roundr.match(/[0-9]+/)) {
        loadApp('Roundr', '', true);
        await sleep(100);
        button('back');
    }
    logger('end roundr')
}

function create_logger(path, debugging=false) {
    writeFile(path, '', false);
    return function(msg) {
        if (debugging) {
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
}

regular_checks()

