def start_pomodoro(duration):
    pomo_end = time.time() + duration
    remove_notifications()