function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms))}


async function pomo() {
    glob.Pomo_until = 
}


function app_notification(app) {
    launch_task('Notification.create', app.name,
        sec_to_time(app.max_dur - app.dur), 'mw_image_timelapse', 5);
}

function sec_to_time(seconds) {
    let pad = (n, padding) => {
        n = String(n);
        return n.length >= padding ? n : new Array(padding - n.length + 1).join('0') + n;
    }

    let min = Math.floor((seconds) / 60);
    let sec = seconds % 60;

    min = '0' + String(min)
    sec = '0' + String(sec)

    let time_left = `${min.substr(-2)}:${sec.substr(-2)}`
    
    return time_left
}


let glob = {
    get TIMES() { return parseInt(global('TIMES')) },
    
    set Pomo_until(time) { setGlobal('Pomo_until', time) },
}
