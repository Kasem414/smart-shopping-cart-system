from django.urls import path,include
from .views.account_management import SignUpView,LoginView,StoreOwnerList,DeactivateUserView
urlpatterns = [
    path("signup/", SignUpView.as_view() , name="signup"),
    path("login/", LoginView.as_view() , name="login"),
    path("GetStoreOwner/", StoreOwnerList.as_view(), name="list-store-owner"),
    path("GetStoreOwner/<int:id>/deactivate/", DeactivateUserView.as_view(), name="deactivate-store-owner"),
]
