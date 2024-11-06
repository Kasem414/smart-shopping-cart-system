from abc import ABC,abstractmethod


class IProduct(ABC):
    @abstractmethod
    def get_all():
        pass
    @abstractmethod
    def get_product_by_id(product_id):
        pass
    @abstractmethod
    def get_product_by_name(name):
        pass
    @abstractmethod
    def get_product_by_category(category_id):
        pass
    @abstractmethod
    def  get_product_by_category_slug(slug):
        pass
    @abstractmethod
    def create(data):
        pass
    @abstractmethod
    def update(product,data):
        pass
    @abstractmethod
    def delete(product):
        pass