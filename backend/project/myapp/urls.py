from django.urls import path,include
from .views.account_management import SignUpView,LoginView 
urlpatterns = [
    path("signup/", SignUpView.as_view() , name="signup"),
    path("login/", LoginView.as_view() , name="login"),
]
