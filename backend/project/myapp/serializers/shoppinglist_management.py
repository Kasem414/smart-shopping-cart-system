from rest_framework import serializers
from ..models import Product, ShoppingList, ShoppingListItem
from ..repositories.product_repo import ProductRepository

repo = ProductRepository()

class ProductItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id','name','image','price','quantity']

class ShoppingListItemSerializer(serializers.ModelSerializer):
    product = ProductItemSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(queryset=repo.get_all(),source="product",write_only=True)
    picked_up = serializers.BooleanField(required=False)
    class Meta:
        model = ShoppingListItem
        fields = ['id','product','product_id','quantity','picked_up','total_price']

class ShoppingListSerializer(serializers.ModelSerializer):
    items = ShoppingListItemSerializer(many=True)
    total_cost = serializers.ReadOnlyField()
    class Meta:
        model = ShoppingList
        fields = ['id','name','items','total_cost','created_at']
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        shopping_list = ShoppingList.objects.create(**validated_data)
        for item_data in items_data:
            product_id = item_data.get('product').id
            quantity = item_data.get('quantity')
            picked_up = item_data.get('picked_up',False)
            ShoppingListItem.objects.create(shopping_list=shopping_list,product_id=product_id,quantity=quantity,picked_up=picked_up)
        return shopping_list
    def update(self,instance,validated_data):
        items_data = validated_data.pop('items')
        instance.name = validated_data.get('name',instance.name)
        instance.save()
        for item_data in items_data:
            product_id = item_data.get('product_id').id
            quantity = item_data.get('quantity')
            picked_up = item_data.get('picked_up',False)
            ShoppingListItem.objects.update_or_create(shopping_list=instance,product_id=product_id,defaults={'quantity':quantity,'picked_up':picked_up})
        return instance