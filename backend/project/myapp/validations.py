from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
import re
def validate_password_complexity(password):
    if not re.search(r'[A-Z]',password):
        raise ValidationError("The password must contain at least one uppercase letter (A-Z).")
    if not re.search(r'[a-z]',password):
        raise ValidationError("The password must contain at least one lowercase letter (a-z).")
    if not re.search(r'[0-9!@#$%^&*(),.:?":{}|<>]',password):
        raise ValidationError("The password must contain at least one number (0-9) or symbol (e.g., !, #, %).")
    return password
# def validate_path(grid,path,start,goal):
#     assert path[0] == start, "Path does not start at the correct position"
#     assert path[-1] == goal, "Path does not end at the correct position"
#     for i in range(1,len(path)):
#         x1,y1 = path[i-1]
#         x2,y2 = path[i]
#         assert abs(x1 - x2) + abs(y1 - y2) == 1, "Path contains invalid moves"
#         assert grid[x2][y2] == 0, "Path passes through a non-walkable cell"
