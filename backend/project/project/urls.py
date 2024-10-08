from django.contrib import admin
from django.urls import path,include
from django.conf.urls.static import static
from . import settings
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
schema_view = get_schema_view()

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('myapp.urls')),
    path("swagger/", schema_view.with_ui('swagger',cache_timeout=0), name="schema-swagger-ui"),
    path('api/',include('myapp.api.urls')),
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
    path("auth/", include('djoser.urls.authtoken')),
]  + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
