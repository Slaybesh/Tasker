/* #################################################################### */
/* ################################ UI ################################ */
/* #################################################################### */
//#region
class UI {
  constructor() {
    this.scene = 'Pomo'
    this.button_start = new Element(this.scene, 'Start')
    this.button_pause = new Element(this.scene, 'Pause')
    this.button_resume = new Element(this.scene, 'Resume')
    this.button_end = new Element(this.scene, 'End')
    // this.button_ = new Element(this.scene, 'resume')
  }

  start() {
    this.button_start.hide()
    this.button_pause.show()

    start_session()
  }

  pause() {
    this.button_pause.hide()
    this.button_resume.show()
    this.button_end.show()

    this.button_resume.move(225, 1185)
    this.button_end.move(585, 1185)

    glob.Pomo_status = 'pause'
  }

  resume() {
    this.button_resume.move(405, 1185)
    this.button_end.move(405, 1185)

    this.button_pause.show()
    this.button_resume.hide()
    this.button_end.hide()

    glob.Pomo_status = 'running'
  }

  end() {
    this.button_resume.move(225, 1185)
    this.button_end.move(585, 1185)

    this.button_start.show()
    this.button_resume.hide()
    this.button_end.hide()
  }
}

class Element {
  constructor(scene, elem) {
      this.scene = scene
      this.elem = elem
  }
  show(speed = 200) { launch_task('elemVisibility show', this.scene, this.elem, speed) }
  hide(speed = 200) { launch_task('elemVisibility hide', this.scene, this.elem, speed) }
  move(x, y, speed = 200, orientation = 'port') { elemPosition(this.scene, this.elem, orientation, x, y, speed) }

  text(text, mode = 'repl') { elemText(this.scene, this.elem, mode, text) }
  border(color, size) { elemBorder(this.scene, this.elem, size, color) }
  focus(element) { performTask('Scene Focus', parseInt(priority) + 1, this.scene, element) }
}
//#endregion


/* ################################################################################ */
/* ################################ pomo functions ################################ */
/* ################################################################################ */
async function start_session(session='pomo') {

  let session_until = session == 'pomo' ? glob.Pomo_until : glob.Break_until
  let time_left;

  while (session_until >= glob.TIMES || glob.Pomo_status == 'running') {
    time_left = sec_to_time(session_until - glob.TIMES)
    create_notification(time_left)
    elemText('Pomo', 'Time Left', 'repl', time_left)
    await sleep(500)
  }

  if (glob.Pomo_status == 'finished') {
    finish_session(session)
  }
}

function create_normal_notification(time_left) {
  launch_task('Notification.create', 'Pomo Session', time_left, glob.computer, 5);
}

function finish_session(session) {
  let text = session == 'pomo' ? 'Pomo Session' : 'Break'
  launch_task('Notification.pomo_finished', 'Pomo Session', text + ' done.', glob.waiting, 5);
  vibratePattern('0, 50, 50, 200')
}




/* ######################################################################### */
/* ################################ helpers ################################ */
/* ######################################################################### */
//#region
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

function sec_to_time(seconds) {

  let min = Math.floor((seconds) / 60);
  let sec = seconds % 60;

  min = '0' + String(min)
  sec = '0' + String(sec)

  return `${min.substr(-2)}:${sec.substr(-2)}`
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
//#endregion


const create_logger = logging('Tasker/log/pomo.txt', true)

let glob = {
  break: 'mw_places_free_breakfast',
  computer:'mw_hardware_computer',
  waiting: 'mw_action_alarm_on',

  get TIMES() { return parseInt(global('TIMES')) },
  get Pomo_until() { return parseInt(global('Pomo_until')) },
  get Pomo_status() { return global('Pomo_status') },
  
  set Pomo_until(time) { setGlobal('Pomo_until', time) },
  set Pomo_status(status) { return setGlobal('Pomo_status', status) },
}
