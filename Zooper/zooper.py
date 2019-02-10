def x_offset(o):
    return f'[ox]{o}[/ox]\n'

def y_offset(o):
    return f'[oy]{o}[/oy]\n'

def rotation(r):
    return f'[r]{r}[/r]\n'


#region circle
def circle_radius(r):
    return f'[ar]{r}[/ar]\n'

def circle_angle(a):
    return f'[as]{a}[/as]\n'
#endregion circle

#region rectangle
def rect_width(w):
    return f'[rw]{w}[/rw]\n'

def rect_height(h):
    return f'[rh]{h}[/rh]\n'
#endregion rectangle

def math(content):
    return f'$({content})$'

def if_else(condition, true, false):
    return f'${condition}?{true}:{false}$'

sunset_hour = '#ASH#'
sunset_in_min = '#ASH# * 60 + #ASm#'
sunset_min = '#ASm#'

sunrise_hour = '#ARH#'
sunrise_in_min = '#ARH# * 60 + #ARm#'
sunrise_min = '#ARm#'



def sunbar_bar(sun_in_min):
    text = ''
    text += y_offset(-120)

    text += rect_width(2)
    text += rect_height(25)

    circle_angle = 360
    circle_angle_offset = 180
    min_in_day = 24 * 60
    
    text += circle_radius(150)
    angle = math(f'(({sun_in_min}) / {min_in_day}) * {circle_angle} - {circle_angle_offset}')
    text += circle_angle(angle)
    text += rotation(angle)

    return text

def sun():
    text = ''

    asdf = 240 + (( -120 / ( sunset_in_min - sunrise_in_min )) * ARTm)
    x = math(f'240 + ((-120 / (({sunset_in_min}) - ({sunrise_in_min}) )))))')
    text += circle_angle()

print(sunbar_bar(sunset_in_min))
print(sunbar_bar(sunrise_in_min))