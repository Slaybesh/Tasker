
function test(...args) {
    console.log('test', args)
    test2(...args)
}

function test2(taskname, arg1, arg2, ...args) {
    console.log(taskname, arg1, arg2, args)
}

test('taskname',124,561, 124)