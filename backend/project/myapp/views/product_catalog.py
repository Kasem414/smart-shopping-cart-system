from ..models import Product,Category
from rest_framework import generics, status
from rest_framework.response import Response
from ..serializers.product_management import ProductSerializer
from ..serializers.catalog_serializer import ProductStoreSerializer,ProductCatalogSerializer
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.serializers import ValidationError
from ..repositories.product_repo import ProductRepository

repo = ProductRepository()
class ProductCatalogView(generics.ListAPIView):
    queryset = repo.get_all()
    permission_classes = [AllowAny]
    serializer_class = ProductSerializer

class ProductDetailCatalogView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    queryset = repo.get_all()
    serializer_class = ProductCatalogSerializer

    def get(self, request, *args, **kwargs):
        product_data = repo.get_product_by_id(product_id=kwargs['id'])
        serializer=self.serializer_class(instance=product_data)
        response={"message":"the requested product", 'data':serializer.data}
        return Response(data=response, status=status.HTTP_200_OK)


class ProductByStoreView(generics.ListAPIView):
    Permission_classes = [AllowAny]
    serializer_class = ProductStoreSerializer

    def get(self, request, *args, **kwargs):
        product_data = repo.get_product_by_id(product_id=kwargs['id'])
        serializer=self.serializer_class(instance=product_data, many=True)
        response={"message":"the requested product for a specific store", 'data':serializer.data}
        return Response(data=response, status=status.HTTP_200_OK)