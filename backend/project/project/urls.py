from django.contrib import admin
from django.urls import path,include
from django.conf.urls.static import static
from . import settings
urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('myapp.urls')),
    path('api/',include('myapp.api.urls')),
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
     path("auth/", include('djoser.urls.authtoken')),
]  + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
