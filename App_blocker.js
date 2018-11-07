async function app_blocker() {

    let logger = create_logger('main', true)

    let t0 = performance.now();
    performTask('regular_checks', glob.higher_prio);
    // logger('regular_checks time: ' + timer(t0))

    logger(`var par1: ${par1}`)
    let blocked;
    if (par1) {
        blocked = par1;
    } else {
        blocked = 0;
    }

    logger(`first blocked = ${blocked}`)

    let ui = new UI(blocked);

    if (blocked) {
        ui.load(app);
    }
    
    let app = await get_app_json();
    
    if (app.blocked_until > glob.TIMES) {
        ui.blocked = 1;
        ui.load(app);
        logger('currently blocked');
    } else if (app.freq > app.max_freq) {
        ui.blocked = 1;
        ui.load(app);
        logger('max freq');
        reset_vars(app);
    } else if (glob.TIMES - app.last_used > app.reset_time) {
        app.dur = 0;
        app.freq = 0;
    } 

    app.freq = app.freq + 1;
    ui.load(app)

    let ai = {package: aipackage}

    let loop_packages = [app.package, 'com.android.systemui', 'net.dinglisch.android.taskerm'];
    logger('start part: ' + timer(t0));
    while (loop_packages.includes(ai.package) && global('TRUN').includes('App Blocker')) {

        app.last_used = glob.TIMES;

        // logger('ai.package: ' + ai.package);
        performTask('Notification.create', glob.higher_prio,
                    `${app.name}|${sec_to_time(app.max_dur - app.dur)}|mw_image_timelapse|5`);
        
        // await sleep(500);
        ai = await get_current_app();
        setGlobal(app.package_var, JSON.stringify(app, null, 2));

        if (app.dur > app.max_dur) {
            ui.blocked = 1;
            ui.load(app)
            reset_vars(app);
            break
        }


        if ([app.package, 'com.android.systemui'].includes(ai.package)) {
            /* only add to duration if in app or system ui */
            app.dur = app.dur + (glob.TIMES - app.last_used);
        }
    }

    performTask('Notification.cancel', glob.higher_prio, app.name);
    setGlobal(app.package_var, JSON.stringify(app, null, 2));
    logger('out of app');
    exit();
}

/* ##################################################################################### */
/* ################################ app_blocker helpers ################################ */
/* ##################################################################################### */
//#region
async function get_app_json() {
    /* vars_str is a JSON string containing 
       app information */

    // let logger = create_logger('get_app_json', true)

    // let ai = await get_current_app();
    // let ai = JSON.parse(global('Return_AutoInput_UI_Query'));

    // logger('var aipackage = ' + aipackage)
    let package_var = aipackage.replace(/\./g, '_');
    // let package_var = ai.package.replace(/\./g, '_');
    package_var = package_var.charAt(0).toUpperCase() + package_var.slice(1);

    let app_json_str = global(package_var);
    let app_json;
    if (app_json_str) {
        app_json = JSON.parse(app_json_str);
    } else {
        app_json = {
            max_dur: 600,
            reset_time: 3600,
            max_freq: 10,

            name: ai.app,
            package: ai.package,
            package_var: package_var,
            dur: 0,
            freq: 0,
            last_used: 0,
            blocked_until: 0,
        }
        setGlobal(package_var, JSON.stringify(app_json, null, 2));
    }
    return app_json
}

async function get_current_app() {
    let logger = create_logger('get_current_app', false)
    let t0 = performance.now();
    await launch_task('AutoInput UI Query');
    let ai = JSON.parse(global('Return_AutoInput_UI_Query'));
    logger(global('Return_AutoInput_UI_Query'))
    logger(timer(t0));
    return ai
}

function reset_vars(app) {

    app.dur = 0;
    app.freq = 0;
    app.blocked_until = glob.TIMES + app.reset_time;
    setGlobal(app.package_var, JSON.stringify(app, null, 2));
    
    performTask('Notification.snooze');
}
//#endregion


/* #################################################################### */
/* ################################ UI ################################ */
/* #################################################################### */
//#region

class UI {
    constructor(blocked=false) {
        
        this.blocked = blocked;
        this.ui = 'app'
        // destroyScene(this.ui)
        // createScene(this.ui)
        // showScene(this.ui, 'ActivityFullWindow', 0, 0, false, false)
    }
    
    load(app) {

        this.setInformation(app)
        this.createMathExercise(this.blocked)
        this.showElements()
    }

    async showElem(name, show, speed=200) {
        let logger = create_logger('UI: showElem')
        let t0 = performance.now()
        elemVisibility(this.ui, name, show, speed)
        logger('took: ' + timer(t0))
    }

    async showElements() {

        let logger = create_logger('UI: showElements', true)
        logger('this.blocked: ' + this.blocked)

        let t0 = performance.now()
        
        this.showElem('Loading', false)
        logger(timer(t0))
        this.showElem('Line1', true)
        this.showElem('Line2', true)
        // elemVisibility(this.ui, 'Loading', false, 200)
        // elemVisibility(this.ui, 'Line1', true, 200)
        // elemVisibility(this.ui, 'Line2', true, 200)
        if (this.blocked) {
            this.showElem('Button Close', true)
            // elemVisibility(this.ui, 'Blocked Button', true, 200)
        } else {
            this.showElem('Math Question', true)
            this.showElem('Math Input', true)
            this.showElem('Button Hide', true)
            // elemVisibility(this.ui, 'Math Input', true, 200)
            // elemVisibility(this.ui, 'Math Question', true, 200)
            // elemVisibility(this.ui, 'Not Blocked Button', true, 200)
        }
        // elemVisibility(this.ui, 'Time Left', true, 300)
        // elemVisibility(this.ui, 'Times Used', true, 300)
    }

    setInformation(app) {
        let curr_time = glob.TIMES;
        let Pomo_until = glob.Pomo_until;
        let Disengaged_until = glob.Disengaged_until;
        let Disengaged = glob.Disengaged;
        
        let line1 = '';
        let line2 = '';
        if (this.blocked) {
            if (Pomo_until > curr_time) {
                line1 = 'Currently in Pomo Session.'
                line2 = `Come back at ${unix_to_time(Pomo_until)}`;
            } else if (Disengaged_until > curr_time) {
                line1 = 'Currently Disengaged.';
                line2 = `Come back at ${unix_to_time(Disengaged_until)}`;
            } else if (Disengaged) {
                line1 = 'Currently Disengaged.';
                line2 = 'Come back tomorrow.';
            }
        } else {
            if (app.blocked_until > curr_time) {
                line1 = 'Currently blocked.';
                line2 = `Come back at ${unix_to_time(app.blocked_until)}`;
            } else {
                line1 = `Time used: ${sec_to_time(app.dur)} out of ${sec_to_time(app.max_dur)}`;
                line2 = `Times opened: ${app.freq} out of ${app.max_freq}`;
            }
        }
        elemText(this.ui, 'Line1', 'repl', line1)
        elemText(this.ui, 'Line2', 'repl', line2)
    }

    createMathExercise(difficulty) {
        let logger = create_logger('UI: Math', false)

        let randint = (min, max) => {return Math.floor(Math.random() * (max - min + 1)) + min}

        let round_up = (rounding_num, round_to) => {
            return rounding_num % round_to == 0 ? rounding_num : rounding_num + round_to - rounding_num % round_to
        }

        let range;
        let small_range;
        let big_range;
        switch(difficulty) {
            case 0:
                small_range = [3, 9];
                big_range = [20, 100];
                break;
            case 1:
                small_range = [9, 20];
                big_range = [100, 4000];
                break;
        }

        let operations = ['*', '+', '-', '/']
        let operator = operations[randint(0, operations.length - 1)]

        let small_num1 = randint(small_range[0], small_range[1]);
        let small_num2 = randint(small_range[0], small_range[1]);
        let big_num1 = randint(big_range[0], big_range[1]);
        let big_num2 = randint(big_range[0], big_range[1]);

        let result;
        let question;
        switch(operator) {
            case '+':
                result = big_num1 + big_num2;
                question = `${big_num1} + ${big_num2}  = `
                break;
                
            case '-':
                result = big_num1 - big_num2;
                question = `${big_num1} - ${big_num2}  = `
                break;
                
            case '*':
                result = small_num1 * small_num2;
                question = `${small_num1} * ${small_num2}  = `
                break;
                
            case '/':
                let bigger_num = small_num1 * small_num2;
                result = small_num1;
                question = `${bigger_num} / ${small_num2}  = `
            
            // case '-/':
            //     result = (max_large - min_large) / randint(2, 4);
            //     break;
            
            // default:
            //     result = big_num1 + big_num2;
            //     question = `${big_num1} + ${big_num2}  =`
        }

        logger(`${operator}, ${small_num1}, ${small_num2}, ${big_num1}, ${big_num2}`)
        logger(`question: ${question} result: ${result}`)
        elemText(this.ui, 'Math Question', 'repl', question);
        elemText(this.ui, 'Math Result', 'repl', result);

    }
}
//#endregion


/* ######################################################################### */
/* ################################ helpers ################################ */
/* ######################################################################### */
//#region
function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms))}

async function launch_task(task_name) {

    let logger = create_logger('launch_task', false)
    logger('launching: ' + task_name)

    performTask(task_name, glob.higher_prio);
    while (global('TRUN').includes(task_name)) {
        await sleep(100)
    }

    logger('finishing: ' + task_name)
}

function timer(start_time) {
    return String(parseInt(performance.now() - start_time) / 1000) + ' sec'
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

function unix_to_time(unix_ts) {
    let date = new Date(unix_ts * 1000);
    let hour = '0' + date.getHours();
    let min = '0' + date.getMinutes();
    let time = `${hour.substr(-2)}:${min.substr(-2)}`;
    return time
}




function logging(path, global_debugging=true) {

    // this.path = path;
    // this.global_debugging = global_debugging;
    writeFile(path, '', false);

    return function create_logger(name, debugging=true) {

        return function(msg) {
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
                writeFile(path, `${time}:    ${name}:    ${msg}\n`, true);
            }
        }
    }
}
//#endregion

const create_logger = logging('Tasker/log/app_blocker.txt', true)

let glob = {
    higher_prio: parseInt(priority) + 1,
    get TIMES() {return parseInt(global('TIMES'))},
    get Disengaged() {return parseInt(global('Disengaged'))},
    get Disengaged_until() {return parseInt(global('Disengaged_until'))},
    get Pomo_until() {return parseInt(global('Pomo_until'))}
}

var aipackage;
var par1;
app_blocker();
