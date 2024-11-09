from rest_framework import serializers
from ..models import Category


class CategorySerializer(serializers.ModelSerializer):
    name = serializers.CharField(required=True)
    class Meta:
        model = Category
        fields = ['id','name','slug','image','store_id']
        # this line make serializer doesn't expect store_id from the client when updating
        read_only_fields = ['store_id']