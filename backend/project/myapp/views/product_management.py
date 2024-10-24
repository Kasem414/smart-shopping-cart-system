from rest_framework import generics, status
from rest_framework.response import Response
from ..repositories.product_repo import ProductRepository
from ..models import Category,Product, ProductImage
from ..serializers.product_management import ProductImageSerializer,ProductSerializer
from ..permissions import IsStoreOwner
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.serializers import ValidationError

repo = ProductRepository()
class ProductListView(generics.ListAPIView):
    queryset = repo.get_all()
    permission_classes = [IsStoreOwner]
    serializer_class = ProductSerializer


class ProductCreateView(generics.CreateAPIView):
    permission_classes = [IsStoreOwner]
    serializer_class = ProductSerializer
    def post(self, request, *args, **kwargs):
        product_data=request.data.copy()
        product_data.pop('csrfmiddlewaretoken',None)
        serializer=self.serializer_class(data=product_data)
        if serializer.is_valid(raise_exception=True):
            category = serializer.validated_data['category']
            name = serializer.validated_data['name']
            slug = serializer.validated_data['slug']
            description = serializer.validated_data['description']
            price = serializer.validated_data['price']
            quantity = serializer.validated_data['quantity']
            old_price = serializer.validated_data['old_price']
            available = serializer.validated_data['available']
            if Product.objects.filter(name=name).exists():
                raise ValidationError({'message':'Product already exists.'})
            product_data = {
                'category' : category,
                'name' : name,
                'slug' : slug,
                'description' : description,
                'price' : price,
                'quantity' : quantity,
                'old_price' : old_price,
                'available' : available,
            }
            product = repo.create(data=product_data)
            images = request.FILES.getlist('images')
            for image in images:
                ProductImage.objects.create(product=product,image=image)
            return Response(ProductSerializer(product).data,status=status.HTTP_201_CREATED)
        return Response({'message':serializer.errors},status=status.HTTP_400_BAD_REQUEST)
    
class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsStoreOwner]
    queryset = repo.get_all()
    lookup_field = 'pk'
    serializer_class = ProductSerializer

class ProductDetailBySlugView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsStoreOwner]
    queryset = repo.get_all()
    lookup_field = 'slug'
    serializer_class = ProductSerializer 
