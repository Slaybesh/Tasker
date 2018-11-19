function disengage() {
    if (parseInt(global('Indoor'))) {
        setGlobal('Disengaged', 1);
        performTask('Remove Notifications');
        shell('settings put secure accessibility_display_daltonizer_enabled 1', true);
        enableProfile('Wake Up', true);
        // setWifi(false);
        // mobileData(false);
    }
}
disengage()