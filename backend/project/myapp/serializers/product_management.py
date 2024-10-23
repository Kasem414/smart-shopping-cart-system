from rest_framework import serializers
from ..models import Product, ProductImage
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['image']

class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, required=False)

    class Meta:
        model = Product
        fields = ['id','category','name','slug','description','price','quantity','old_price','available','images']
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        print(ret)
        ret['quantity'] = int(instance.quantity)
        return ret
    def create(self, validated_data):
        images_data = validated_data.pop('images',[])
        product = Product.objects.create(**validated_data)
        for image_data in images_data:
            ProductImage.objects.create(product=product,**image_data)
        return product