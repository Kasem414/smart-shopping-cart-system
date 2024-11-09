from django.forms import ValidationError
from ..models import  Category, Store
from django.core.exceptions import ObjectDoesNotExist
from .ICategory import ICategory
class CategoryRepository(ICategory):
    @staticmethod
    def get_all():
        try:
            return Category.objects.all()
        except ObjectDoesNotExist:
            return None
    @staticmethod
    def get_by_id(category_id):
        try:
            return Category.objects.get(id=category_id)
        except ObjectDoesNotExist:
            return None
    @staticmethod
    def get_by_slug(slug):
        try:
            return Category.objects.get(slug=slug)
        except ObjectDoesNotExist:
            return None
    @staticmethod
    def get_category_by_name(name):
        try:
            return Category.objects.get(name=name)
        except ObjectDoesNotExist:
            return None
    @staticmethod
    def create(category_data):
        # These lines for fixing problem "Value error:Cannot assign "4": "Category.store_id" must be a "store" instance.
        ###
        store_id = category_data.pop('store_id')
        store_instance = Store.objects.get(id=store_id)
        category_data['store_id'] = store_instance
        ###
        category =Category.objects.create(**category_data)
        # category = Category(**category_data)
        category.save()
        return category
    @staticmethod
    def update(category,updated_data):
        for key, value in updated_data.items():
            # If updating the store, retrieve the store instance and set it
            # These lines for fixing problem "Value error:Cannot assign "4": "Category.store_id" must be a "store" instance.
            ###
            if key == 'store_id':
                store_instance = Store.objects.get(id=value)
                # Fetch the store instance by ID
                setattr(category,'sotre',store_instance)
            ###
            else:
                setattr(category,key,value)
        category.save()
        return category
    @staticmethod
    def delete(category):
        category.delete()

    @staticmethod
    # get product by store using id
    def get_category_by_store(store_id):
        try:
            store = Store.objects.get(id=store_id)
            return store.categories.all()
        except ObjectDoesNotExist:
            return None