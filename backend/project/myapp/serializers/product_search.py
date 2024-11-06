from rest_framework import serializers
from ..models import Product

class ProductSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id','category','name','description','price','old_price','quantity','available','featured','get_image']