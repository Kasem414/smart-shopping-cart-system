from rest_framework import generics, status
from rest_framework.response import Response
from ..repositories.product_repo import ProductRepository
from ..models import Category,Product
from ..serializers.product_management import ProductSerializer
from ..permissions import IsStoreOwner
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.serializers import ValidationError
from rest_framework.exceptions import PermissionDenied
class ProductListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProductSerializer
    def get_queryset(self):
        if self.request.user.is_anonymous or self.request.user.account_type == 'customer':
            quereyset = ProductRepository.get_product_by_store(store_id=1)
            return quereyset
        store = self.request.user.managed_stores.first()
        # Filter categories by the store to restrict access
        return Product.objects.filter(store_id=store.id)


class ProductCreateView(generics.CreateAPIView):
    permission_classes = [IsStoreOwner]
    serializer_class = ProductSerializer
    def post(self, request, *args, **kwargs):
        product_data=request.data
        if not hasattr(request.user,'managed_stores') or request.user.managed_stores.count() == 0:
            raise ValidationError({'detail': 'You do not have a store associated with your account.'})
        # Get the store owned by the user
        # Assuming a store owner has only one store 
        store = request.user.managed_stores.first()
        # Set the store_id for the product
        product_data['store_id'] = store.id
        # Check if product with same name exists in the store
        name = product_data.get('name')
        if Category.objects.filter(name=name,store_id=store.id).exists():
            raise ValidationError({'message':'Product already exists for your store.'})
        serializer=self.serializer_class(data=product_data,context={'request': request})
        if serializer.is_valid(raise_exception=True):
            validated_data = serializer.validated_data
            validated_data['store_id'] = store.id
            # To check if there an image in request 
            if 'image' in request.FILES:
                product_data['image'] = request.FILES['image']
            product = ProductRepository.create(data=validated_data)
            return Response(ProductSerializer(product,context={'request':request}).data,status=status.HTTP_201_CREATED)
        return Response({'message':serializer.errors},status=status.HTTP_400_BAD_REQUEST)
    
class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsStoreOwner]
    lookup_field = 'pk'
    serializer_class = ProductSerializer
    def get_queryset(self):
        if not hasattr(self.request.user,'managed_stores') or self.request.user.managed_stores.count() == 0:
            raise PermissionDenied({'detail': 'You do not have a store associated with your account.'})
        store = self.request.user.managed_stores.first()
        # Filter products by the store to restrict access
        return Product.objects.filter(store_id=store.id)
    def put(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = ProductSerializer(instance,data=request.data,partial=True,context={'request': request})
        if serializer.is_valid(raise_exception=True):
            updated_product = ProductRepository.update(product=instance,data=serializer.validated_data)
            return Response(ProductSerializer(updated_product,context={'request': request}).data,status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

class ProductDetailBySlugView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsStoreOwner]
    queryset = ProductRepository.get_all()
    lookup_field = 'slug'
    serializer_class = ProductSerializer 
