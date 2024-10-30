from django.urls import path,include
from .views.account_management import SignUpView,LoginView,StoreOwnerList,DeactivateUserView,ListCustomerView
from .views.category_management import CategoryCreateView,CategoryDetailBySlugView,CategoryDetailView,CategoryListView
from .views.product_management import ProductCreateView,ProductDetailBySlugView,ProductListView,ProductDetailView
from .views.product_catalog import ProductCatalogView,ProductDetailCatalogView, ProductByStoreView
from rest_framework.routers import DefaultRouter
from .views.shoppinglist_management import ProductViewSet, ShoppingListViewSet
# from .views.shoppinglist_management import ShoppingListDetailView,RemoveItemFromShoppingListView,AddItemToShoppingListView,MarkItemPickedView,UpdateItemQuantityView,ShoppingListListCreateView
router = DefaultRouter()
router.register(r'shopping-products',ProductViewSet,basename='shopping-products')
router.register(r'shopping-lists',ShoppingListViewSet,basename='shopping-list')
urlpatterns = [
    # Account management 
    path("signup/", SignUpView.as_view() , name="signup"),
    path("login/", LoginView.as_view() , name="login"),
    path("GetStoreOwner/", StoreOwnerList.as_view(), name="list-store-owner"),
    path("GetCustomer/", ListCustomerView.as_view(), name="list-customer"),
    path("GetStoreOwner/<int:id>/deactivate/", DeactivateUserView.as_view(), name="deactivate-store-owner"),
    # Category management endpoints
    path("categories/",CategoryListView.as_view() , name="category-list"),
    path("categories/create/",CategoryCreateView.as_view() , name="category-create"),
    path("categories/<int:pk>",CategoryDetailView.as_view() , name="category-detail-update-delete"),
    path("categories/<slug:slug>", CategoryDetailBySlugView.as_view() , name="category-detail-update-delete-slug"),
    # Product management endpoints
    path("products/",ProductListView.as_view() , name="product-list"),
    path("products/create/",ProductCreateView.as_view() , name="product-create"),
    path("products/<int:pk>",ProductDetailView.as_view() , name="product-detail-update-delete"),
    path("products/<slug:slug>", ProductDetailBySlugView.as_view() , name="product-detail-update-delete-slug"),
    # Product catalog endpoints
    path("catalog/", ProductCatalogView.as_view(), name="product-catalog-list"),
    path("catalog/details/<int:id>/", ProductDetailCatalogView.as_view(), name="product-catalog-detail"),
    path("catalog/store/<int:id>/", ProductByStoreView.as_view(), name="product-catalog-by-store"),
    # Product Search

    # Shopping List Management endpoints
    path('',include(router.urls)),
    path("shopping-lists/add-to-list/", ShoppingListViewSet.as_view({'post': 'add_to_list'}), name="add-to-list"),    
    path("shopping-lists/remove-from-list/", ShoppingListViewSet.as_view({'delete':'remove_from_list'}), name="remove-from-list"),
    path("shopping-lists/update-quantity/", ShoppingListViewSet.as_view({'patch': 'update_quantity'}), name="update-quantity"),
    path("shopping-lists/toggle-picked-up/", ShoppingListViewSet.as_view({'patch': 'toggle_picked_up'}), name="toggle-picked-up"),
    # Other Method
    # path('shopping-lists/', ShoppingListListCreateView.as_view(), name='shopping-list-list-create'),
    # path('shopping-lists/<int:list_id>/', ShoppingListDetailView.as_view(), name='shopping-list-detail'),
    # path('shopping-lists/<int:list_id>/add-item/', AddItemToShoppingListView.as_view(), name='add-item-to-shopping-list'),
    # path('shopping-lists/<int:list_id>/update-item/<int:product_id>/', UpdateItemQuantityView.as_view(), name='update-item-quantity'),
    # path('shopping-lists/<int:list_id>/remove-item/<int:product_id>/', RemoveItemFromShoppingListView.as_view(), name='remove-item-from-shopping-list'),
    # path('shopping-lists/<int:list_id>/mark-picked/<int:product_id>/', MarkItemPickedView.as_view(), name='mark-item-picked'),
]

