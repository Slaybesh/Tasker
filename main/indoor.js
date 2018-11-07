function indoor() {
    setGlobal('Indoor', 1);
    setGlobal('Outdoor', 0);
    shell('settings put system doze_mode_policy 1');

    if (parseInt(global('Car'))) {
        performTask('stop_blitzer');
    }
    performTask('regular_checks');
}
indoor()