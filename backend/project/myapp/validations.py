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