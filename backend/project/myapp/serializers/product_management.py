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
        extra_kwargs = {
            'quantity' : {'required' : True},
            'price' : {'required' : True}
        }
    def to_representation(self, instance):
        try:
            ret = super().to_representation(instance)
            return ret
        except Exception as e:
            print(f"Error during serialization: {e}")
            raise e
    def create(self, validated_data):
        images_data = validated_data.pop('images',[])
        product = Product.objects.create(**validated_data)
        for image_data in images_data:
            ProductImage.objects.create(product=product,**image_data)
        return product