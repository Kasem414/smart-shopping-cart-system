from django.urls import path,include
from .views import getRoutes,MyTokenObtainPairView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
urlpatterns = [
    path("", getRoutes),
    path("api/token/", MyTokenObtainPairView.as_view(),name='token_obtain_pair'),
    path("api/token/refresh/",TokenRefreshView.as_view(), name='token_refresh'),
]
