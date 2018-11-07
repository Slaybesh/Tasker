function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms))}

async function wait(x) {
    for (i=0; i<x; i++) {
        await sleep(1000)
    }
    exit();
}

var num;
wait(num)
