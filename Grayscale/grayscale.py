import time
import math

SCREEN = True
Grayscale = False
Screen_on_time = 0
Gray_time = 1200 * 1000

Time_screen_off = time.time_ns()

Time_back_factor = 3

while True:
    screen_on()

    grayscale_on()
    grayscale_off()


def screen_on():
    if SCREEN:

        # milliseconds     unix_time_ms      unix_time_ms
        screen_off_time = time.time_ns() - Time_screen_off
        time_back = round(screen_off_time / Time_back_factor)
        Screen_on_time -= time_back

        if Screen_on_time < 0:
            Screen_on_time = 0

        kwgt()

        while SCREEN:
            start_time = time.time_ns()
            time.sleep(1)
            if Screen_on_time < Gray_time:

                Screen_on_time += time.time_ns() - start_time

                if Screen_on_time > Gray_time:
                    Screen_on_time = Gray_time

                kwgt()

    else:
        Time_screen_off = time.time_ns()


def kwgt():
    if grayscale_val():
        string = f'Time left until Color: {time_left(Screen_on_time * Time_back_factor, 0)}'
    else:
        string = f'Time left until Grayscale: {time_left(Gray_time, Screen_on_time)}'

def grayscale_on():
    if Screen_on_time > Gray_time:
        Grayscale = True

def grayscale_off():
    if Screen_on_time == 0:
        Grayscale = False

def grayscale_val():
    return Grayscale

def time_left(time1, time2):
    if time1 - time2 > -1:
        time_left1 = math.floor(round((time1 - time2) / 1000) / 60)
        time_left2 = round((time1 - time2) / 1000) % 60

        return f'{time_left1}:{time_left2}'
    else:
        return '00:00'