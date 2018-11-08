function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms))}

class Element {
    constructor(scene, elem) {
        this.scene = scene
        this.elem = elem
    }
    hide(speed) {
        elemVisibility(this.scene, this.elem, false, speed)
    }
    show(speed) {
        elemVisibility(this.scene, this.elem, true, speed)
    }
    border(color, size) {
        elemBorder(this.scene, this.elem, size, color)
    }
    text(text, mode='repl') {
        elemText(this.scene, this.elem, mode, text)
    }
    focus(element) {
        performTask('Scene Focus', parseInt(priority) + 1, this.scene, element)
    }

    on(color, speed) {
        this.hide(0)
        this.border(color, 2)
        this.show(speed)
    }

    off(color, speed) {
        this.hide(speed)
        this.border(color, 0)
        this.show(0)
    }
}

let anim = new Element('Test Scene', 'Rectangle1')

//#region animations
async function anim1() {

    anim.on('ff0000', 200)
    await sleep(200)
    anim.off('000000', 200)
    exit()
}

async function anim2() {

    anim.on('ff0000', 200)
    await sleep(100)
    anim.off('000000', 200)
    exit()
}

async function anim3() {

    anim.on('ff0000', 100)
    await sleep(100)
    anim.off('000000', 200)
    exit()
}

async function anim4() {

    anim.on('ff0000', 100)
    await sleep(100)
    anim.off('000000', 300)
    exit()
}
//#endregion

var func;
// eval(func + '()')

async function blink(scene, elem) {
    return new Promise(async function(resolve) {
        elemVisibility(scene, elem, true, 200)
    });
}

function launch_task(task_name, par1, par2, ...parameters) {
    let new_par1;
    let new_par2;
    
    if (parameters.length > 0) {
        new_par1 = `${par1}|${par2}`;
        for (i in parameters) {new_par1 += `|${parameters[i]}`}
    } else {
        new_par1 = par1;
        new_par2 = par2;
    }

    performTask(task_name, parseInt(priority) + 1, new_par1, new_par2)
}

// let higher_prio = parseInt(priority) + 1;
async function show() {
    let scene = 'Test Scene'

    launch_task('elemVisibility show', scene, 'Rectangle1', 300)
    launch_task('elemVisibility show', scene, 'Rectangle11', 300)
    launch_task('elemVisibility show', scene, 'Rectangle12', 300)
    launch_task('elemVisibility show', scene, 'Rectangle13', 300)

    flash('asdf')
}

show()