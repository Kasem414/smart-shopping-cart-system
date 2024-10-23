from django.forms import ValidationError
from ..models import  Category
from django.core.exceptions import ObjectDoesNotExist

class CategoryRepository:
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
    def get_category_by_name(self,name):
        try:
            return Category.objects.get(name=name)
        except ObjectDoesNotExist:
            return None
    @staticmethod
    def create(category_data):
        category = Category(**category_data)
        category.save()
        return category
    @staticmethod
    def update(category,updated_data):
        for key, value in updated_data.items():
            setattr(category,key,value)
            category.save()
    @staticmethod
    def delete(category):
        category.delete()