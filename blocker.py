def app_blocker(par1):


    scene.reset()
    app_ui(par1)

    if blocked_until > TIMES or Disengaged:
        close(par1, false)
        return
    elif freq > max_freq:
        close(par1, true)
        return
    elif TIMES - last_used > max_dur * 3:
        dur = 0
        freq = 0

    freq += 1
    while True:
        last_used = TIMES
        aipackage = ai.query()
        # print(aipackage)

        time_left = time_left(par1)
        Notify(name, time_left)
        time.sleep(0.333)
        if aipackage == (package or systemui):
            dur += TIMES - last_used

            
        if dur > max_dur:
            close(par1, true)
            return

        if aipackage == (package or systemui or tasker): continue
        else: break


def app_close(par1, write):

    go_home()

    if write:
        dur = 0
        freq = 0
        blocked_until = TIMES + max_dur * 3

        index = Blocked_apps.index(package)
        if index != 0:
            Blocked_times[index] = blocked_until
        else:
            Blocked_apps.append(package)
            Blocked_times.append(blocked_until)

    remove_notifications()
    app_show_ui()
    # app.kill(package)


def app_ui(args):
    reset_scene()

    time_left = time_left_notification(max_dur, dur)

    if Disengaged_until > TIMES:
        date = VariableConvert(Disengage_until)
    elif Disengaged:
        time = 'tomorrow.'
    elif blocked_until > TIMES:
        date = VariableConvert(blocked_until)

    if date:
        time = 'at ' + date[-1]
    blocked_text = 'Currently blocked. Comeback {}.'.format(time)
    
    if not blocked_text: blocked_text = ''

    scene.set_information('{}, Time left: {}, Times opened {}'
                          .format(blocked_text, time_left, freq))
    ui.show()


def remove_notifications():
    if not Disengaged:
        for i in range(len(Blocked_apps)):
            if Blocked_times[i] > TIMES:
                nlqkey = nl.qkey(Blocked_apps[i])
                snooze_time = (Blocked_times[i] - TIMES) * 1000
                for key in nlqkey:
                    nl.snooze(key, snooze_time)
    elif Disengaged:
        if Disengaged_until > TIMES:
            snooze_time = (Disengage_until - TIMES) * 1000
        else:
            snooze_time = 3600 * 1000
        for app in All_notification_packages:
            nlqkey = nl.qkey(app)
            for key in nlqkey:
                nl.snooze(key, snooze_time)


