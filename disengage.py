def disengage():
    Disengaged = True

    profile_wake_up(on)
    profile_engage(off)
    profile_auto_turn_off_wifi(on)

    remove_notifications() # 3h
    screen.change_colors(weird)
    wifi.off()
    mobile_data.off()


def wake_up():
    time_start = time.time()
    while screen.off():
        time.sleep(5)

    time_screen_off = time.time() - time_start

    if time_screen_off > 10800: # 3h
        Disengage_until = time.time() + 10800 # 3h


def engage():
    Disengaged = False

    profile_auto_turn_off_wifi(off)
    profile_wake_up(off)

    screen.change_colors(normal)
    wifi.on()
    mobile_data.on()


def start_pomodoro(duration):
    pomo_end = time.time() + duration
    disengage()
