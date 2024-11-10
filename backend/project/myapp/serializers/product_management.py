from rest_framework import serializers
from ..models import Product,Category
from ..repositories.product_repo import ProductRepository 
repo = ProductRepository()
# class ProductImageSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ProductImage
#         fields = ['image']

class ProductSerializer(serializers.ModelSerializer):
    old_price = serializers.DecimalField(max_digits=10,decimal_places=2,required=False,allow_null=True)
    class Meta:
        model = Product
        fields = ['id','category','name','description','price','old_price','quantity','available','featured','image','get_image','store_id']
        extra_kwargs = {
            'price' : {'required' : True},
        }
    # def to_representation(self, instance):
    #     try:
    #         ret = super().to_representation(instance)
    #         return ret
    #     except Exception as e:
    #         print(f"Error during serialization: {e}")
    #         raise e
    def get_image(self,obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None
    def create(self, validated_data):
        product = Product.objects.create(**validated_data)
        return product
    def update(self,instance,validated_data):
        category_data = validated_data.pop('category',None)
        if category_data:
            category = Category.objects.get(slug=category_data)
            instance.category = category
        for attr, value in validated_data.items():
            setattr(instance,attr,value)
            instance.save()
        print(instance)
        return instance

