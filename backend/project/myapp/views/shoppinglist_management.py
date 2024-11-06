from rest_framework import viewsets, status,generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny,IsAuthenticated
from ..permissions import IsCustomer
from rest_framework.decorators import action
from ..models import Product, ShoppingList, ShoppingListItem,MyUser
from ..serializers.shoppinglist_management import ShoppingListSerializer,ShoppingListItemSerializer,ProductItemSerializer
from ..repositories.product_repo import ProductRepository
from rest_framework.views import APIView
repo = ProductRepository()


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = repo.get_all()
    serializer_class = ProductItemSerializer

class ShoppingListViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = ShoppingListSerializer
    def get_queryset(self):
        return ShoppingList.objects.filter(customer=self.request.user)
    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)
    @action(detail=True,methods=['POST'],url_path='add-to-list')
    def add_to_list(self,request,pk=None):
        # fetch the shopping list instance using the pk
        try:
            shopping_list = self.get_object()
        except ShoppingList.DoesNotExist:
            return Response({"error":"Shopping list not found."},status=status.HTTP_404_NOT_FOUND)
        # extract product data from request body
        product_data = request.data.get('product')
        if not product_data:
            return Response({"error":"Product is required."},status=status.HTTP_400_BAD_REQUEST)
        # assuming product_data contains 'product_id' and 'quantity'
        if isinstance(product_data,list):
            for item_data in product_data:
                product_id = item_data.get('product_id')
                quantity = item_data.get('quantity',1)
            # Add logic to add the product to the shopping list (e.g., create a shopping list item if using a related model)
                shopping_list_item, created = ShoppingListItem.objects.update_or_create(shopping_list=shopping_list
                                                                            ,product_id=product_id,defaults={'quantity': quantity})
        else:
            product_id = product_data.get('product_id')
            quantity = product_data.get('quantity',1)
            shopping_list_item, created = ShoppingListItem.objects.update_or_create(shopping_list=shopping_list
                                                                            ,product_id=product_id,defaults={'quantity': quantity})
        if created:
            return Response({"status": "Item added to the shopping list."},status=status.HTTP_201_CREATED)
        else:
            return Response({"status": "Item updated in the shopping list."},status=status.HTTP_200_OK)
    @action(detail=True,methods=['delete'],url_path='remove-from-list/(?P<product_id>[^/.]+)')
    def remove_from_list(self,request,pk=None,product_id=None):
        try:
            shopping_list = self.get_object()
            shopping_list_item = ShoppingListItem.objects.filter(shopping_list=shopping_list,product_id=product_id).first()
            if not shopping_list_item:
                return Response({"error": "Product not found in shopping list."},status=status.HTTP_404_NOT_FOUND)  
            shopping_list_item.delete()
            return Response({"message": "Item is deleted successfully."},status=status.HTTP_204_NO_CONTENT)
        except ShoppingList.DoesNotExist:
            return Response({"error": "Shopping list not found."},status=status.HTTP_404_NOT_FOUND)
    @action(detail=True,methods=['patch'],url_path='update-quantity/(?P<product_id>[^/.]+)')
    def update_quantity(self,request,pk=None,product_id=None):
        try:
            # This get the list related customer with pk for this list, we use this in queryset
            shopping_list = self.get_object()
            quantity = request.data.get('quantity')
            if quantity is None:
                return Response({"error": "Quantity is required."},status=status.HTTP_400_BAD_REQUEST)
            # first() is useful to avoid errors in case there are multiple matching items, as it only fetches one item and ignores the rest
            shopping_list_item = ShoppingListItem.objects.filter(shopping_list=shopping_list,product_id=product_id).first()
            if not shopping_list_item:
                return Response({"error": "Product not found in shopping list."},status=status.HTTP_404_NOT_FOUND)
            shopping_list_item.quantity = quantity
            shopping_list_item.save()
            return Response({"message": "Quantity updated successfully."},status=status.HTTP_200_OK)
        except ShoppingList.DoesNotExist:
            return Response({"error": "Shopping list not found."},status=status.HTTP_404_NOT_FOUND)
    @action(detail=True,methods=['patch'],url_path='toggle-picked-up/(?P<product_id>[^/.]+)')
    def toggle_picked_up(self,request,pk=None,product_id=None):
        try:
            shopping_list = self.get_object()
            # first() is useful to avoid errors in case there are multiple matching items, as it only fetches one item and ignores the rest
            shopping_list_item = ShoppingListItem.objects.filter(shopping_list=shopping_list,product_id=product_id).first()
            if not shopping_list_item:
                return Response({"error": "Product not found in shopping list."},status=status.HTTP_404_NOT_FOUND)
            shopping_list_item.picked_up = not shopping_list_item.picked_up
            shopping_list_item.save()
            return Response({"message": f"Item '{shopping_list_item.product.name}' marked as {'picke up' if shopping_list_item.picked_up else 'not picked up.'}"}
                             ,status=status.HTTP_200_OK)
        except ShoppingList.DoesNotExist:
            return Response({"error": "Shopping list not found."},status=status.HTTP_404_NOT_FOUND)