# from typing import Any
# from django.contrib.auth.backends import ModelBackend
# from django.contrib.auth import get_user_model
# from django.contrib.auth.base_user import AbstractBaseUser
# from django.http import HttpRequest

# User = get_user_model()

# class EmailBackend(ModelBackend):
#     def authenticate(self, request,username=None,password=None,**kwargs):
#         try:
#          user = User.objects.get(email=username)
#         except User.DoesNotExist:
#             return None
#         if user.check_password(password):
#            return user
#         return None
        