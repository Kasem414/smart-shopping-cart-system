from ..models import Product, Category, Store
from django.core.exceptions import ObjectDoesNotExist

class ProductRepository:
    @staticmethod
    def get_all(): 
        return Product.objects.all()
    @staticmethod
    def get_product_by_id(product_id):
        try:
            return Product.objects.get(id=product_id)
        except ObjectDoesNotExist:
            return None
    @staticmethod
    def get_product_by_name(self,name):
        try:
            return Product.objects.get(name=name)
        except ObjectDoesNotExist:
            return None
    @staticmethod
    # get product by category using id
    def get_product_by_category(category_id):
        try:
            category = Category.objects.get(id=category_id)
            return category.products.all()
        except ObjectDoesNotExist:
            return None
    @staticmethod
    # get product by category using slug
    def get_product_by_category_slug(slug):
        try:
            category = Category.objects.get(slug=slug)
            return category.products.all()
        except ObjectDoesNotExist:
            return None
    @staticmethod
    # get product by store using id
    def get_product_by_store(store_id):
        try:
            store = Store.objects.get(id=store_id)
            return store.products.all()
        except ObjectDoesNotExist:
            return None
    @staticmethod
    def create(data):
        return Product.objects.create(**data)
    @staticmethod
    def update(product,data):
        if isinstance(product,Product):
            for attr, value in data.items():
                setattr(product,attr,value)
            product.save()
            return product
        else:
            raise TypeError("Expected a product instance, got something else.")
    # def update(instance,validated_data):
    #     for field, value in validated_data.items():
    #         setattr(instance,field,value)
    #     print(instance)
    #     instance.save()
    #     return instance
    @staticmethod
    def delete(self,product):
        product.delete()