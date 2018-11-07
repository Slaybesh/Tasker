function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms))}

class myClass {
    constructor() {
        this.a = 0;
    }

    async wait() {
        await sleep(1000)
    }
    async test() {
        console.log('before')
        this.wait(1000)
        console.log('after')
    }
}

myclass = new myClass;
myclass.test()