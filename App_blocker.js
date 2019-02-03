/* ############################################################################# */
/* ################################ app_blocker ################################ */
/* ############################################################################# */
//#region
async function app_blocker() {

  let t0 = performance.now();
  let logger = create_logger('main', true)

  /* ####TODO####
  if starting app, put aipackage in a global var so it doesnt run twice
  from different profiles.
  */
  /* check if blocked by seeing which profile its running from */
  let blocked = running_profile()
  let ui = new UI(blocked);

  let app = get_app_data();
  app = init_app(app)

  ui.load(app)

  logger('start part:', timer(t0));

  await run_main_loop(app, ui)
  await await_task('regular_checks');

  logger('exit()');
  exit();
}

/* ################################ app_blocker functions ################################ */
//#region
async function run_main_loop(app, ui) {
  let logger = create_logger('main_loop', true)

  let t0 = performance.now();

  let loop_packages = [app.package, 'com.android.systemui', 'net.dinglisch.android.taskerm'];
  app_session: /* #### main loop #### */
  while (true) {

    app.last_used = glob.TIMEMS;

    // await sleep(500);
    ai = await get_current_open_app()

    /* ################ if out of app ################ */
    if (!loop_packages.includes(ai.package)) {
      logger('out of app')
      let t1 = performance.now()

      launch_task('Notification.cancel', app.name)
      glob.save_app_data(app)

      out_of_session:
      while (true) {
        ai = await get_current_open_app()

        if (app.package.includes(ai.package)) {
          logger('back in app')
          break out_of_session;
        } else if (elapsed(t1) > glob.keep_session_open_time) {
          logger('close session')
          break app_session;
        }
        await sleep(500)
      }
    }/*################ if out of app ################ */


    create_notification(app, logger)
    t0 = save_app_data(app, t0)


    /*  exceeded app.max_duration */
    if (app.dur / 1000 >= app.max_dur) {
      app = set_blocked_until(app);
      ui.load(app)
      logger('app.dur > app.max_dur')
      break app_session;
    }


    /* only add to duration if in app or system ui */
    if ([app.package, 'com.android.systemui'].includes(ai.package)) {
      /* ####TODO#### test %WIN for current window, if in notification 
                      thing, add to time, if on recent apps page, dont */
      let time_past = (glob.TIMEMS - app.last_used)
      logger('time_past:', time_past)
      logger('app dur before:', app.dur)
      app.dur += time_past
      logger('app dur after:', app.dur)
    }
  }
}


function running_profile() {
  let logger = create_logger('running_profile')
  let blocked;

  if (glob.pactive.includes('Disengaged Apps')) {
    glob.append_package('Apps_disengaged', glob.aipackage)
    blocked = 1;
  }
  if (glob.pactive.includes('Pomo Apps')) {
    glob.append_package('Apps_pomo', glob.aipackage)
    blocked = 1;
  }
  if (glob.pactive.includes('Limited Apps')) {
    glob.append_package('Apps_limited', glob.aipackage)
    blocked = 0;
  }

  if (blocked == null) {
    flashLong('No App Blocker Profile Running')
    // exit()
  }

  logger('blocked:', blocked)
  logger('PACTIVE:', glob.pactive)
  return blocked
}


function get_app_data() {
  let logger = create_logger('get_app_data', true)

  // let ai = await get_current_app();
  // let ai = JSON.parse(global('Return_AutoInput_UI_Query'));

  logger('aipackage = ' + glob.aipackage)
  let package_var = glob.aipackage.replace(/\./g, '_');
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

      name: glob.aiapp,
      package: glob.aipackage,
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


function init_app(app) {

  let logger = create_logger('init_app')

  app.freq = app.freq + 1;

  /* if app has been opened too many times */
  if (app.freq >= app.max_freq) {
    app = set_blocked_until(app);
    logger('max freq');
  }

  /* if app hasnt been used in a while */
  if (glob.TIMES - app.last_used / 1000 > app.reset_time) {
    app.dur = 0;
    app.freq = 0;
  }
  return app
}
//#endregion


/* ################################ app_blocker helpers ################################ */
//#region
async function get_current_open_app() {
  let logger = create_logger('get_current_open_app', false)

  let t0 = performance.now();
  await await_task('AutoInput UI Query');
  let ai = JSON.parse(global('Return_AutoInput_UI_Query'));

  logger(global('Return_AutoInput_UI_Query'))
  logger('took:', timer(t0));
  return ai
}


function save_app_data(app, t0) {
  if ((elapsed(t0)) > glob.save_data_interval) {
    /* if 5sec have passed, save var */
    // logger('save global var')
    t0 = performance.now()
    glob.save_app_data(app)
  }
  return t0
}

function set_blocked_until(app) {

  app.dur = 0;
  app.freq = 0;
  app.blocked_until = glob.TIMES + app.reset_time;
  glob.save_app_data(app)

  launch_task('Notification.snooze');

  return app
}


function create_notification(app, logger) {
  let time_left = sec_to_time(app.max_dur - parseInt(app.dur / 1000))
  logger('time_left:', time_left)
  launch_task('Notification.create', app.name,
    time_left, 'mw_image_timelapse', 5);
}
//#endregion
//#endregion



/* #################################################################### */
/* ################################ UI ################################ */
/* #################################################################### */
//#region

class UI {
  constructor(blocked = false) {
    this.blocked = blocked;
    this.ui = 'app'
  }

  load(app, show_ui = false) {
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

    this.elem_hide('Loading')
    this.elem_show('Line1')
    this.elem_show('Line2')

    if (this.blocked || app.blocked_until > glob.TIMES) {
      this.elem_show('Button Close')
    } else {
      this.elem_show('Math Question')
      this.elem_show('Math Input')
      this.elem_show('Button Hide')

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
        line1 = `Time used: ${sec_to_time(app.dur / 1000)} out of ${sec_to_time(app.max_dur)}`;
        line2 = `Times opened: ${app.freq} out of ${app.max_freq}`;
      }
    }

    logger('line1: ' + line1)
    logger('line2: ' + line2)
    elemText(this.ui, 'Line1', 'repl', line1)
    elemText(this.ui, 'Line2', 'repl', line2)
  }

  createMathExercise(app) {
    let logger = create_logger('UI: Math', true)

    let randint = (min, max) => { return Math.floor(Math.random() * (max - min + 1)) + min }

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
    switch (operator) {
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

    // logger(`${operator}, ${small_num1}, ${small_num2}, ${big_num1}, ${big_num2}`)
    logger(`question: ${question} result: ${result}`)
    elemText(this.ui, 'Math Question', 'repl', question);
    elemText(this.ui, 'Math Result', 'repl', result);
  }

  /* ################################ Helpers ################################ */

  elem_show(elem, speed=200) { launch_task('elemVisibility show', this.ui, elem, speed) }
  elem_hide(elem, speed=200) { launch_task('elemVisibility hide', this.ui, elem, speed) }
}
//#endregion


/* ######################################################################### */
/* ################################ helpers ################################ */
/* ######################################################################### */
//#region
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }


function launch_task(task_name, par1, par2, ...parameters) {

  let logger = create_logger('launch_task', false)
  let new_par1;
  let new_par2;

  if (parameters.length > 0) {
    new_par1 = `${par1}|${par2}`;
    for (i in parameters) { new_par1 += `|${parameters[i]}` }
  } else {
    new_par1 = par1;
    new_par2 = par2;
  }

  logger(task_name, new_par1, new_par2, ...parameters)
  performTask(task_name, parseInt(priority) + 1, new_par1, new_par2)
}


async function await_task(task_name, ...args) {

  let logger = create_logger('await_task', false)
  logger('launching:', task_name, ...args)

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
//#endregion


const create_logger = logging('Tasker/log/app_blocker.txt', true)

var aiapp;
var aipackage;
var pactive;

let glob = {

  aiapp: aiapp,
  aipackage: aipackage,
  pactive: pactive,

  save_data_interval: 5 * 1000, //s * ms
  keep_session_open_time: 10 * 1000, //s * ms

  get PACTIVE() { return global('PACTIVE') },
  get TIMES() { return parseInt(global('TIMES')) },
  get TIMEMS() { return parseInt(global('TIMEMS')) },
  get Disengaged() { return parseInt(global('Disengaged')) },
  get Disengaged_until() { return parseInt(global('Disengaged_until')) },
  get Pomo_until() { return parseInt(global('Pomo_until')) },


  save_app_data(app) { setGlobal(app.package_var, JSON.stringify(app, null, 2)) },

  append_package(list_name, package) {
    let logger = create_logger('append_package')

    let list = JSON.parse(global(list_name))

    // logger(`${list_name}: ${list}, ${package}`)

    if (!list.includes(package)) {
      list.push(package)
      logger(`${package} added to ${list_name}`)
      setGlobal(list_name, JSON.stringify(list, null, 2))
    }
  }
}


app_blocker();
