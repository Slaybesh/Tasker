let json = JSON.parse(json_str)

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

for (let key in json) {
    // let val = '`${json[key]}`'
    // eval(`var ${key} = ${val}`)
    setGlobal(capitalizeFirstLetter(key), json[key])
}

exit()