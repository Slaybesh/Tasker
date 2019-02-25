function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

jQuery.ajaxSetup({async:false});

// let json_str;
$.get('https://dl.dropboxusercontent.com/1/view/ll1opj7lz3vljn4/boxifier/tasker/Zooper/zooper_variables.txt', (data) => {
    // flash(data)
    // json_str = data;
    let json = JSON.parse(data);
    
    for (let key in json) {
        setGlobal(capitalizeFirstLetter(key), json[key])
    }
});

exit()