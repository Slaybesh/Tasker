function night_mode_on() {
    performTask('Change image')
    shell('settings put system oem_nightmode_progress_status 100', true)
    /* stock night mode */
    shell('settings put secure night_display_activated 1', true)
    /* warm screen calibration */
    shell('settings put system screen_color_mode_settings_value 3', true)

    setGlobal('Night_mode', 1)

}

function night_mode_on() {
    performTask('Change image')
    // shell('settings put system oem_nightmode_progress_status 100', true)
    /* stock night mode */
    shell('settings put secure night_display_activated 0', true)
    /* warm screen calibration */
    shell('settings put system screen_color_mode_settings_value 1', true)

    setGlobal('Night_mode', 0)

}