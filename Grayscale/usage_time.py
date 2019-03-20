import time

class Usage:
    def __init__(self):

        self.screen_on = True

        self.screen_on_time = 0
        self.grayscale = False
        self.grayscale_time_start = time.time()
        
        self.screen_off_timer = time.time()

        self.time_back_factor = 3


    def main_loop(self):
        while True:
            if self.screen_on:
                screen_off_time = time.time() - self.screen_off_timer

                if time.time() - screen_off_time > 3600:
                    self.screen_on_time = 0
                    self.grayscale = False
                else:
                    time_back = (screen_off_time / self.time_back_factor)
                    if self.screen_on_time - time_back >= 0:
                        self.screen_on_time -= time_back
                    else:
                        self.screen_on_time = 0


                while self.screen_on:
                    time.sleep(1)
                    self.screen_on_time += 1

                self.screen_off_timer = time.time()


            if self.screen_on_time > 1200:
                self.grayscale = True
                self.grayscale_time_start = time.time()
