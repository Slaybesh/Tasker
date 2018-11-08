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
    move(x, y, speed, orientation='port') {
        elemPosition(this.scene, this.elem, orientation, x, y, speed)
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

async function check_math() {

    let elem_math_input = new Element('app', 'Math Input')
    if (math_input == math_result) {
        hideScene('app')
    } else {
        // performTask('Scene Focus', parseInt(priority) + 1, 'app', 'Math Result')
        elem_math_input.focus('Math Result')
        // elemVisibility('app', 'Math Input', false, 100)
        // elemText('app', 'Math Input', 'repl', '')
        // elemBorder('app', 'Math Input', 2, 'ff0000')
        // elemVisibility('app', 'Math Input', true, 200)
        elem_math_input.hide(100)
        elem_math_input.text('')
        elem_math_input.border('ff0000', 2)
        elem_math_input.show(100)
        
        await sleep(100)
        
        elem_math_input.hide(300)
        elem_math_input.border('000000', 0)
        elem_math_input.show(0)
        
        // elemVisibility('app', 'Math Input', false, 200)
        // elemBorder('app', 'Math Input', 0, '000000')
        // elemVisibility('app', 'Math Input', true, 0)

        elem_math_input.focus('Math Input')
        performTask('Scene Focus', parseInt(priority) + 1, 'app', 'Math Input')
    }
    exit()
}

async function by_pass() {
    button_close = new Element('app', 'Button Close')
    // button_hide = new Element('app', 'Button Hide')
    button_close.move(400, 880, 200)
    launch_task('elemVisibility show', 'app', 'Button Hide', 300)
    launch_task('elemVisibility hide', 'app', 'Button Close', 300)
    launch_task('elemVisibility show', 'app', 'Math Question', 200)
    launch_task('elemVisibility show', 'app', 'Math Input', 200)
    exit()
}

var math_input;
var math_result;
var fct;
eval(fct + '()')
