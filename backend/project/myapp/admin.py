from django.contrib import admin
from .models import MyUser,Category
from django.contrib.admin import AdminSite
class MyAdminSite(AdminSite):
    def has_permission(self, request):
        return True
    def has_module_perms(self,app_label):
        return True
    def has_perm(sef,perm,obj=None):
        return True
admin_site = MyAdminSite(name='myadmin')
class MyUserAdmin(admin.ModelAdmin):
    def has_view_permission(self, request, obj = ...):
        return True
    def has_module_permission(self, request):
        return True
class CategoryAdmin(admin.ModelAdmin):
    def has_view_permission(self, request, obj = ...):
        return True
    def has_module_permission(self, request):
        return True
admin_site.register(MyUser,MyUserAdmin)
admin_site.register(Category,CategoryAdmin)

