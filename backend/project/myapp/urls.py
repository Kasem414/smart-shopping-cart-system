from django.urls import path,include
from .views.account_management import SignUpView,LoginView,StoreOwnerList,DeactivateUserView
from .views.category_management import CategoryCreateView,CategoryDetailBySlugView,CategoryDetailView,CategoryListView

urlpatterns = [
    path("signup/", SignUpView.as_view() , name="signup"),
    path("login/", LoginView.as_view() , name="login"),
    path("GetStoreOwner/", StoreOwnerList.as_view(), name="list-store-owner"),
    path("GetStoreOwner/<int:id>/deactivate/", DeactivateUserView.as_view(), name="deactivate-store-owner"),
    path("categories/",CategoryListView.as_view() , name="category-list"),
    path("categories/create/",CategoryCreateView.as_view() , name="category-create"),
    path("categories/<int:pk>/",CategoryDetailView.as_view() , name="category-detail-update-delete"),
    path("categories/<slug:slug>/", CategoryDetailBySlugView.as_view() , name="category-detail-slug"),
]
