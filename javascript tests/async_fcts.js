
function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms))}

async function slow() {
    await sleep(1000)
    // console.log('slow')
    // setTimeout(() => {console.log("slow promise is done")}, 1000);
}

async function main() {
    let output1 = slow()
    let output2 = slow()

    await output1
    await output2

    console.log('exit')
}

main()