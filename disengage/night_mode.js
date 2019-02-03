function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }

function night_mode_on() {
    nightmode.activated = 1
    nightmode.screen_calibration = 3
}
function night_mode_off() {
    nightmode.enabled = 0
    nightmode.screen_calibration = 1
}

function change_warmness(val) {
    nightmode.enabled = 0
    nightmode.progress = val
    nightmode.enabled = 1
}


async function main() {
    let logger = create_logger('main')
    for (let i=132; i>0; i-=30) {
        logger(i)
        change_warmness(i)
        await sleep(2000)
    }
    // night_mode_on()
    exit()
}



function custom_setting(mode, setting, value, use_root=true) {
    shell(`settings put ${mode} ${setting} ${value}`, use_root);
}

function logging(path, global_debugging = true) {

    writeFile(path, '', false);
    return function create_logger(name, debugging = true) {
        return function (...input_msg) {
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
                writeFile(path, `${time}:  ${name}: ${msg}\n`, true);
            }
        }
    }
}

const create_logger = logging('Tasker/log/night_mode.txt', true)

let nightmode = {
    set enabled(bool) { custom_setting('secure', 'night_display_activated', bool) },
    set progress(val) { custom_setting('system', 'oem_nightmode_progress_status', val) }, // 1 - 132

    set screen_calibration(val) { custom_setting('system', 'screen_color_mode_settings_value', val) }, // 1 - 3

    set color_blind_enabled(bool) { custom_setting('secure', 'accessibility_display_daltonizer_enabled', bool) }, // 11 - 13
    set color_blind_mode(val) { custom_setting('secure', 'accessibility_display_daltonizer', val) }, // 11 - 13
}

main()