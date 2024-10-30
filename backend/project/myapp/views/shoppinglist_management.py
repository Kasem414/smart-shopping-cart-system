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
    permission_classes = [IsCustomer]
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
    
# # View to list all shopping lists or create a new one
# class ShoppingListListCreateView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         shopping_lists = ShoppingList.objects.filter(customer=request.user)
#         serializer = ShoppingListSerializer(shopping_lists, many=True)
#         return Response(serializer.data)

#     def post(self, request):
#         serializer = ShoppingListSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save(customer=request.user)
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# # View to retrieve, update, or delete a specific shopping list
# class ShoppingListDetailView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get_object(self, list_id, user):
#         try:
#             return ShoppingList.objects.get(id=list_id, customer=user)
#         except ShoppingList.DoesNotExist:
#             return None

#     def get(self, request, list_id):
#         shopping_list = self.get_object(list_id, request.user)
#         if not shopping_list:
#             return Response(status=status.HTTP_404_NOT_FOUND)
#         serializer = ShoppingListSerializer(shopping_list)
#         return Response(serializer.data)

#     def delete(self, request, list_id):
#         shopping_list = self.get_object(list_id, request.user)
#         if not shopping_list:
#             return Response(status=status.HTTP_404_NOT_FOUND)
#         shopping_list.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)

# # View to add an item to a shopping list
# class AddItemToShoppingListView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, list_id):
#         try:
#             shopping_list = ShoppingList.objects.get(id=list_id, customer=request.user)
#         except ShoppingList.DoesNotExist:
#             return Response(status=status.HTTP_404_NOT_FOUND)

#         serializer = ShoppingListItemSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save(shopping_list=shopping_list)
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# # View to update an item's quantity in the shopping list
# class UpdateItemQuantityView(APIView):
#     permission_classes = [IsAuthenticated]

#     def patch(self, request, list_id, product_id):
#         try:
#             shopping_list_item = ShoppingListItem.objects.get(
#                 shopping_list_id=list_id, product_id=product_id, shopping_list__customer=request.user
#             )
#         except ShoppingListItem.DoesNotExist:
#             return Response(status=status.HTTP_404_NOT_FOUND)

#         serializer = ShoppingListItemSerializer(shopping_list_item, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# # View to remove an item from the shopping list
# class RemoveItemFromShoppingListView(APIView):
#     permission_classes = [IsAuthenticated]

#     def delete(self, request, list_id, product_id):
#         try:
#             shopping_list_item = ShoppingListItem.objects.get(
#                 shopping_list_id=list_id, product_id=product_id, shopping_list__customer=request.user
#             )
#         except ShoppingListItem.DoesNotExist:
#             return Response(status=status.HTTP_404_NOT_FOUND)

#         shopping_list_item.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)

# # View to mark an item as picked up
# class MarkItemPickedView(APIView):
#     permission_classes = [IsAuthenticated]

#     def patch(self, request, list_id, product_id):
#         try:
#             shopping_list_item = ShoppingListItem.objects.get(
#                 shopping_list_id=list_id, product_id=product_id, shopping_list__customer=request.user
#             )
#         except ShoppingListItem.DoesNotExist:
#             return Response(status=status.HTTP_404_NOT_FOUND)

#         serializer = ShoppingListItemSerializer(shopping_list_item, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)