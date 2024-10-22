from rest_framework.permissions import BasePermission


class IsStoreOwner(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_authenticated and request.user.account_type == 'store_owner':
            return True