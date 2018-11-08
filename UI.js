class UI {
    constructor(blocked=false) {
        
        this.blocked = blocked;
        this.ui = 'app'
    }
    
    load(app, show_ui=False) {
        if (show_ui) {
            destroyScene(this.ui)
            createScene(this.ui)
        }

        this.setInformation(app)
        this.createMathExercise(this.blocked)
        this.showElements()

        if (show_ui) {
            showScene(this.ui, 'ActivityFullWindow', 0, 0, false, false)
        }
    }


    showElements() {

        this.visibility('Loading', false)
        this.visibility('Line1', true)
        this.visibility('Line2', true)

        if (this.blocked) {
            this.visibility('Button Close', true)
        } else {
            this.visibility('Math Question', true)
            this.visibility('Math Input', true)
            this.visibility('Button Hide', true)

        }
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

    /* ################################ Helpers ################################ */
    visibility(name, show, speed=200) {
        let logger = create_logger('UI: showElem')

        let task_name = 'elemVisibility ';
        if (show) {task_name += 'show'} 
        else      {task_name += 'hide'}

        launch_task(task_name, this.ui, name, speed)
    }


}