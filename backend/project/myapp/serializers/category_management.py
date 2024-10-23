from rest_framework import serializers
from ..models import Category


class CategorySerializer(serializers.ModelSerializer):
    name = serializers.CharField(required=True)
    class Meta:
        model = Category
        fields = ['id','name','slug']
