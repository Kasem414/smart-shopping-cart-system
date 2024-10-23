from ..models import Product, Category
from django.core.exceptions import ObjectDoesNotExist

class ProductRepository:
    @staticmethod
    def get_all(): 
        return Product.objects.all()
    @staticmethod
    def get_product_by_id(self,product_id):
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
    def get_product_by_category(self,category_id):
        try:
            category = Category.objects.get(id=category_id)
            return category.products.all()
        except ObjectDoesNotExist:
            return None
    @staticmethod
    # get product by category using slug
    def get_product_by_category_slug(self,slug):
        try:
            category = Category.objects.get(slug=slug)
            return category.products.all()
        except ObjectDoesNotExist:
            return None
    @staticmethod
    def create(data):
        return Product.objects.create(**data)
    @staticmethod
    def update(self,product,data):
        for attr, value in data.items():
            setattr(product,attr,value)
            product.save()
    @staticmethod
    def delete(self,product):
        product.delete()