async function app_blocker() {

    let logger = create_logger('main', true)

    let t0 = performance.now();

    // logger(`var par1: ${par1}`)
    // let blocked = par1 ? par1 : 0;
    
    let blocked;
    
    let PACTIVE = glob.PACTIVE
    logger('PACTIVE:', PACTIVE)
    if (PACTIVE.includes('Disengaged Apps')) {
        glob.append_package('Apps_disengaged', aipackage)
        blocked = 1;
    }
    if (PACTIVE.includes('Pomo Apps')) {
        glob.append_package('Apps_pomo', aipackage)
        blocked = 1;
    }
    if (PACTIVE.includes('Limited Apps')) {
        glob.append_package('Apps_limited', aipackage)
        blocked = 0;
    }
    logger('blocked:', blocked)

    if (blocked == undefined) {
        flashLong('PACTIVE')
    }

    let app = get_app_json();
    let ui = new UI(blocked);
    
    // if (blocked || app.blocked_until > glob.TIMES) {
    //     /* if in pomo or disengaged session or app is still blocked from usage */
    //     ui.load(app);
    //     logger('currently blocked');
    // }
    if (app.freq > app.max_freq) {
        /* if app has been opened too many times */
        app = reset_vars(app);
        logger('max freq');
    }
    
    if (glob.TIMES - app.last_used > app.reset_time) {
        /* if app hasnt been used in a while */
        app.dur = 0;
        app.freq = 0;
    } 

    app.freq = app.freq + 1;
    
    logger('start part:', timer(t0));
    ui.load(app)
    
    /* #### main loop #### */
    let ai = {package: aipackage}
    let loop_packages = [app.package, 'com.android.systemui', 'net.dinglisch.android.taskerm'];

    app_session:
    while (true) {

        app.last_used = glob.TIMES;

        // await sleep(500);
        ai = await get_current_app()

        /* ################ if out of app ################ */
        if (!loop_packages.includes(ai.package)) {
            logger('out of app')
            let t1 = performance.now()

            launch_task('Notification.cancel', app.name)
            glob.save_global_app(app)

            out_of_app:
            while (true) {
                ai = await get_current_app()

                if (app.package.includes(ai.package)) {
                    logger('back in app')
                    break out_of_app;
                } else if (elapsed(t1) > 10000) {
                    logger('out of app for more than 10 sec')
                    break app_session;
                }
                await sleep(300)
            }
        }

        launch_task('Notification.create', app.name, sec_to_time(app.max_dur - app.dur),
        'mw_image_timelapse', 5);
        
        if (app.dur > app.max_dur) {
            app = reset_vars(app);
            ui.load(app)
            logger('app.dur > app.max_dur')
            break
        } else if ((elapsed(t0)) > 5000) {
            /* if 5sec have passed, save var */
            // logger('save global var')
            t0 = performance.now()
            glob.save_global_app(app)
        }

        if ([app.package, 'com.android.systemui'].includes(ai.package)) {
            /* only add to duration if in app or system ui */
            app.dur = app.dur + (glob.TIMES - app.last_used);
        }
    }

    await await_task('regular_checks');
    logger('exit()');
    exit();
}

/* ##################################################################################### */
/* ################################ app_blocker helpers ################################ */
/* ##################################################################################### */
//#region
function get_app_json() {
    let logger = create_logger('get_app_json', true)

    // let ai = await get_current_app();
    // let ai = JSON.parse(global('Return_AutoInput_UI_Query'));

    let ai = {
        app: aiapp,
        package: aipackage
    }

    logger('ai.package = ' + ai.package)
    let package_var = ai.package.replace(/\./g, '_');
    package_var = package_var.charAt(0).toUpperCase() + package_var.slice(1);

    let app_json_str = global(package_var);
    let app_json;
    if (app_json_str) {
        /* app_json exists */
        app_json = JSON.parse(app_json_str);
    } else {
        /* create new app_json */
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
    await await_task('AutoInput UI Query');
    let ai = JSON.parse(global('Return_AutoInput_UI_Query'));
    
    logger(global('Return_AutoInput_UI_Query'))
    logger(timer(t0));
    return ai
}


function reset_vars(app) {

    app.dur = 0;
    app.freq = 0;
    app.blocked_until = glob.TIMES + app.reset_time;
    glob.save_global_app(app)
    
    launch_task('Notification.snooze');

    return app
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
    }
    
    load(app, show_ui=false) {
        if (show_ui) {
            destroyScene(this.ui)
            createScene(this.ui)
        }

        this.setInformation(app)
        this.createMathExercise(app)
        this.showElements(app)

        if (show_ui) {
            showScene(this.ui, 'ActivityFullWindow', 0, 0, false, false)
        }
    }


    showElements(app) {

        this.visibility('Loading', false)
        this.visibility('Line1', true)
        this.visibility('Line2', true)

        if (this.blocked || app.blocked_until > glob.TIMES) {
            this.visibility('Button Close', true)
        } else {
            this.visibility('Math Question', true)
            this.visibility('Math Input', true)
            this.visibility('Button Hide', true)

        }
    }

    setInformation(app) {
        let logger = create_logger('UI: setInformation', true)

        let curr_time = glob.TIMES;
        let Pomo_until = glob.Pomo_until;
        let Disengaged_until = glob.Disengaged_until;
        let Disengaged = glob.Disengaged;
        
        let line1;
        let line2;
        if (this.blocked) {
            if (Disengaged_until > curr_time) {
                line1 = 'Currently Disengaged.';
                line2 = `Come back at ${unix_to_time(Disengaged_until)}`;
            } else if (Disengaged) {
                line1 = 'Currently Disengaged.';
                line2 = 'Come back tomorrow.';
            } else if (Pomo_until > curr_time) {
                line1 = 'Currently in Pomo Session.'
                line2 = `Come back at ${unix_to_time(Pomo_until)}`;
            } else {
                line1 = 'Currently blocked.'
                line2 = `Come back at the fuck do I know.`;
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

        logger('line1: ' + line1)
        logger('line2: ' + line2)
        elemText(this.ui, 'Line1', 'repl', line1)
        elemText(this.ui, 'Line2', 'repl', line2)
    }

    createMathExercise(app) {
        let logger = create_logger('UI: Math', false)

        let randint = (min, max) => {return Math.floor(Math.random() * (max - min + 1)) + min}

        let round_up = (rounding_num, round_to) => {
            return rounding_num % round_to == 0 ? rounding_num : rounding_num + round_to - rounding_num % round_to
        }

        let small_range;
        let big_range;

        if (this.blocked || app.blocked_until > glob.TIMES) {
            small_range = [9, 20];
            big_range = [100, 4000];
        } else {
            small_range = [3, 9];
            big_range = [20, 100];
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
                let numerator = small_num1 * small_num2;
                result = small_num1;
                question = `${numerator} / ${small_num2}  = `
            
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

    /* ################################ Helpers ################################ */
    visibility(elem, show, speed=200) {
        let logger = create_logger('UI: showElem')

        let task_name = 'elemVisibility ';
        if (show) {task_name += 'show'} 
        else      {task_name += 'hide'}

        launch_task(task_name, this.ui, elem, speed)
    }


}
//#endregion


/* ######################################################################### */
/* ################################ helpers ################################ */
/* ######################################################################### */
//#region
function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms))}


function launch_task(task_name, par1, par2, ...parameters) {

    let logger = create_logger('launch_task', false)
    let new_par1;
    let new_par2;
    
    if (parameters.length > 0) {
        new_par1 = `${par1}|${par2}`;
        for (i in parameters) {new_par1 += `|${parameters[i]}`}
    } else {
        new_par1 = par1;
        new_par2 = par2;
    }

    logger(task_name, new_par1, new_par2, ...parameters)
    performTask(task_name, parseInt(priority) + 1, new_par1, new_par2)
}


async function await_task(task_name, ...args) {

    let logger = create_logger('await_task', false)
    logger('launching:', task_name,...args)

    launch_task(task_name, ...args);
    while (global('TRUN').includes(task_name)) {
        await sleep(100)
    }

    logger('finishing: ' + task_name)
}


function timer(start_time) {
    return String(parseInt(performance.now() - start_time) / 1000) + ' sec'
}

function elapsed(start_time) {
    return performance.now() - start_time
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
                writeFile(path, `${time}:  ${name}: ${msg}\n`, true);
            }
        }
    }
}
//#endregion

const create_logger = logging('Tasker/log/app_blocker.txt', true)


let glob = {
    // PACTIVE(profile) {
    //     let logger = create_logger('PACTIVE')
    //     let pactive = global('PACTIVE')
    //     logger(pactive, pactive.includes(profile))
    //     return pactive.includes(profile)
    // },

    get PACTIVE() { return global('PACTIVE')},
    get TIMES() { return parseInt(global('TIMES')) },
    get Disengaged() { return parseInt(global('Disengaged')) },
    get Disengaged_until() { return parseInt(global('Disengaged_until')) },
    get Pomo_until() { return parseInt(global('Pomo_until')) },


    save_global_app(app) { setGlobal(app.package_var, JSON.stringify(app, null, 2)) },

    append_package(list_name, package) {
        let logger = create_logger('append_package')

        let list = JSON.parse(global(list_name))

        logger(`${list_name}: ${list}, ${package}`)

        if (!list.includes(package)) {
            list.push(package)
            logger('added')
            setGlobal(list_name, JSON.stringify(list, null, 2))
        }
    },
}

var aiapp;
var aipackage;
var par1;
app_blocker();
