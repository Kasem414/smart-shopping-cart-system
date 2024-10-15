from django.contrib import admin
from myapp.admin import admin_site
from django.urls import path,include,re_path
from django.conf.urls.static import static
from . import settings
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
schema_view = get_schema_view(openapi.Info(title="Smart Shopping Cart API",default_version='v1',description="API Documentation"),public=True,permission_classes=[permissions.AllowAny])

urlpatterns = [
    path('admin/',admin_site.urls),
    path('', include('myapp.urls')),
    path('api/',include('myapp.api.urls')),
    re_path(r'^swagger(?P<format>\.json|\.yaml)$',schema_view.without_ui(cache_timeout=0),name='schema-swagger-ui'),
    re_path(r'^redoc/$',schema_view.with_ui('redoc',cache_timeout=0),name='schema-redoc')
]  + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
