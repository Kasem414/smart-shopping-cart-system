from rest_framework import serializers
from ..models import Product,Category
from ..repositories.product_repo import ProductRepository 
repo = ProductRepository()
# class ProductImageSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ProductImage
#         fields = ['image']

class ProductSerializer(serializers.ModelSerializer):
    # images = ProductImageSerializer(many=True, required=False)
    class Meta:
        model = Product
        fields = ['id','category','name','description','price','old_price','available','featured','image']
        extra_kwargs = {
            # 'quantity' : {'required' : True},
            'price' : {'required' : True},
            'image' : {'required' : False}
        }
        # read_only_fields = ['category']
    def to_representation(self, instance):
        try:
            ret = super().to_representation(instance)
            return ret
        except Exception as e:
            print(f"Error during serialization: {e}")
            raise e
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
    # def update(self,instance, validated_data):
    #     print("instance in serializer:",instance)
    #     print("\nvalidated data:",validated_data)
    #     return repo.update(instance,validated_data)
        # category_data = validated_data.pop('category',None)
        # if category_data:
        #     instance.category_id = category_data.id
        #     instance.name = validated_data.get('name',instance.name)
        #     instance.price = validated_data.get('price',instance.price)
        #     instance.save()
        #     return instance