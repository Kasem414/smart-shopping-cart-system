from abc import ABC,abstractmethod

class ICategory(ABC):
    @abstractmethod
    def get_all():
        pass
    @abstractmethod
    def get_by_id(category_id):
        pass
    @abstractmethod
    def  get_by_slug(slug):
        pass
    @abstractmethod
    def get_category_by_name(self,name):
        pass
    @abstractmethod
    def create(data):
        pass
    @abstractmethod
    def update(category,updated_data):
        pass
    @abstractmethod
    def delete(category):
        pass