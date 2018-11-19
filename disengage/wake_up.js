async function wake_up() {
  let logger = create_logger('main')

  let start_time = glob.TIMES
  logger('start time:', start_time)

  dropdown_ui(start_time)
  await screen_on(start_time)

  launch_task('hideScene Wake Up')
  logger('exit: no wake up')
  exit();
}

/* ################################################################################ */
/* ################################ main functions ################################ */
/* ################################################################################ */

async function dropdown_ui(start_time) {
  let logger = create_logger('dropdown_ui')
  logger('start')

  /* show wake up scene, wait until button has been
     pressed and continue */
  await await_task('showScene Wake Up')

  let Wake_up = glob.Wake_up
  logger('global Wake_up', Wake_up)
  if (Wake_up) {
    wake_up_functions(start_time)
    
    logger('exit: wake up button pressed')
    exit()
  }
}


async function screen_on(start_time) {
  /* if screen is longer than some amount of time on, trigger wake up */
  let logger = create_logger('screen_on')
  logger('start')

  while (global('SCREEN') == 'on') {
    await sleep(2000);
    let curr_time = glob.TIMES

    logger('screen on:', curr_time - start_time)
    if (curr_time - start_time > glob.screen_on_time) {
      wake_up_functions(curr_time)
      
      logger(`exit: screen longer than ${glob.screen_on_time} seconds on`)
      exit()
    }
  }
}


function wake_up_functions(curr_time) {
  
  let logger = create_logger('wake_up_functions')
  logger('Disengaged_until:', curr_time + 120 * 60)

  launch_task('hideScene Wake Up')
  
  glob.Disengaged_until = curr_time + 120 * 60; /* 2h */
  glob.Wake_up = 0
  enableProfile('Engage', true);
  enableProfile('Wake Up', false);
}

/* ######################################################################### */
/* ################################ helpers ################################ */
/* ######################################################################### */

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

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }


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

const create_logger = logging('Tasker/log/wake_up.txt', true)

let glob = {
  screen_on_time: 120, // seconds

  get TIMES() { return parseInt(global('TIMES')) },
  get Wake_up() { return parseInt(global('Wake_up')) },
  
  set Disengaged_until(unix) { return setGlobal('Disengaged_until', unix) },
  set Wake_up(val) { setGlobal('Wake_up', val) }
}
wake_up()