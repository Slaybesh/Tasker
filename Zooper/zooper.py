import math
import json


class clock_widget:
    def __init__(self):
        self.y_offset_circle = 20

        self.radius_ring = 100
        self.radius_outer = 130

        self.circumference = int(round(2 * math.pi * self.radius_ring))
        self.y_offset = self.radius_ring + self.y_offset_circle

        self.angle_sunrise = f'({sr_in_min} / {mins_in_day}) * 360 + 180'
        self.angle_sunset = f'({ss_in_min} / {mins_in_day}) * 360 + 180'


        self.text_sun = ''
        self.text_sun += y_offset(-self.y_offset)
        self.text_sun += circle_radius(self.radius_outer)

        self.bar_thickness = 2
        self.bar_length = 30

        self.print_all()


    def print_all(self):

        time = self.time()
        time_circle = self.time_circle()
        time_indicator = self.time_indicator()

        sr_bar = self.sun_bars(self.angle_sunrise)
        ss_bar = self.sun_bars(self.angle_sunset)

        sr_time = self.sun_times('rise')
        ss_time = self.sun_times('set')

        sr_hiding_box = self.sun_hiding_boxes('rise')
        ss_hiding_box = self.sun_hiding_boxes('set')

        sun = self.sun()

        var_dict = {
            'time': time,
            'time_circle': time_circle,
            'time_indicator': time_indicator,

            'sr_bar': sr_bar,
            'ss_bar': ss_bar,

            'sr_time': sr_time,
            'ss_time': ss_time,
            
            'sr_hiding_box': sr_hiding_box,
            'ss_hiding_box': ss_hiding_box,

            'sun': sun,
        }

        print(json.dumps(var_dict, indent=4))

    #region time
    def time(self):
        return y_offset(-self.y_offset)

    def time_circle(self):
        text = ''
        text += x_offset( int(self.circumference / 2) )
        text += y_offset(-self.radius_ring * 2 - self.y_offset_circle)

        text += rect_width(self.circumference)
        text += rect_height(4)

        text += color('20ffffff')

        return text

    def time_indicator(self):
        text = ''
        text += y_offset(-self.y_offset)
        text += circle_radius(self.radius_ring)

        text += rect_width(8)
        text += rect_height(4)

        angle = condition(f'(({hour} * 60 + {minutes}) / {mins_in_day}) * 360 + 180')
        text += circle_angle(angle)
        text += rotation(angle)

        return text
    #endregion time

    #region sun
    def sun_bars(self, sun_angle):
        text = self.text_sun

        text += rect_width(self.bar_thickness)
        text += rect_height(self.bar_length)

        angle = condition(sun_angle)
        text += circle_angle(angle)
        text += rotation(angle)

        return text

    def sun_times(self, rise_set):
        text = self.text_sun

        if rise_set == 'rise':
            angle = self.angle_sunrise
            first_sign = '-'
            second_sign = '+'
        if rise_set == 'set':
            angle = self.angle_sunset
            first_sign = '+'
            second_sign = '-'

        text += circle_angle(condition(f'{angle} {first_sign} 4'))
        text += rotation(condition(f'{angle} {second_sign} 90'))

        return text

    def sun_hiding_boxes(self, rise_set):
        text = self.text_sun
        text += rect_width(self.bar_length)
        text += rect_height(self.bar_length)

        if rise_set == 'rise':
            angle = self.angle_sunrise
            sign = '-'
        if rise_set == 'set':
            angle = self.angle_sunset
            sign = '+'

        text += circle_angle(condition(f'{angle} {sign} 4'))
        text += rotation(angle)

        return text
    
    def sun(self):
        text = self.text_sun

        angle = condition(f'{self.angle_sunrise} + (({self.angle_sunset} - {self.angle_sunrise}) * ({min_since_sr} / ({ss_in_min} - {sr_in_min})))')
        text += circle_angle(angle)

        c = if_else(f'[{hour} >= {sr_h} && {hour} < {ss_h}] || [{hour} = {ss_h} && {minutes}<={ss_min}]', 
                    'ffffffff', '00000000')
        text += color(c)

        # print(text)
        return text


        ''' [ar]140[/ar]

            [as]$( 240 + ((-120/((#ASH#*60+#ASm#)-(#ARH#*60+#ARm#)))*#ARTm#))$[/as]
 
            [c]$[#DH#<#ASH# && #DH#>=#ARH#] || [#DH#=#ASH# && #Dm#<=#ASm#]?ffffffff:00ffffff$[/c]

            [sc]$[#DH#<#ASH# && #DH#>=#ARH#] || [#DH#=#ASH# && #Dm#<=#ASm#]?80000000:00000000$[/sc] '''

    #endregion sun



#region functions
#region standard
def x_offset(o):
    return f'[ox]{o}[/ox]\\n'

def y_offset(o):
    return f'[oy]{o}[/oy]\\n'

def rotation(r):
    return f'[r]{r}[/r]\\n'

def color(c):
    return f'[c]{c}[/c]\\n'
#endregion

#region circle
def circle_radius(r):
    return f'[ar]{r}[/ar]\\n'

def circle_angle(a):
    return f'[as]{a}[/as]\\n'
#endregion circle

#region rectangle
def rect_width(w):
    return f'[rw]{w}[/rw]\\n'

def rect_height(h):
    return f'[rh]{h}[/rh]\\n'
#endregion rectangle

#region logic
def condition(content):
    return f'$({content})$'

def if_else(cond, true, false):
    return f'${cond}?{true}:{false}$'
#endregion
#endregion

#region global vars
hour = '#DH#'
minutes = '#Dm#'

ss_h = '#ASH#'
ss_min = '#ASm#'
ss_in_min = '(#ASH# * 60 + #ASm#)'

sr_h = '#ARH#'
sr_m = '#ARm#'
sr_in_min = '(#ARH# * 60 + #ARm#)'

min_since_sr = '#ARTm#'

mins_in_day = 24 * 60
# circle_degrees = 360
# circle_angle_offset = 180
#endregion global vars


clock_widget()