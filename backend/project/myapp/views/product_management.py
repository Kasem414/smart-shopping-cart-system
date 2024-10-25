from rest_framework import generics, status
from rest_framework.response import Response
from ..repositories.product_repo import ProductRepository
from ..models import Category,Product
from ..serializers.product_management import ProductSerializer
from ..permissions import IsStoreOwner
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.serializers import ValidationError

repo = ProductRepository()
class ProductListView(generics.ListAPIView):
    queryset = repo.get_all()
    permission_classes = [AllowAny]
    serializer_class = ProductSerializer


class ProductCreateView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProductSerializer
    def post(self, request, *args, **kwargs):
        product_data=request.data.copy()
        product_data.pop('csrfmiddlewaretoken',None)
        serializer=self.serializer_class(data=product_data)
        if serializer.is_valid(raise_exception=True):
            category = serializer.validated_data['category']
            name = serializer.validated_data['name']
            description = serializer.validated_data['description']
            price = serializer.validated_data['price']
            quantity = serializer.validated_data['quantity']
            old_price = request.POST['oldPrice']
            available = serializer.validated_data['available']
            featured = serializer.validated_data['featured']
            image = request.FILES['image']
            if Product.objects.filter(name=name).exists():
                raise ValidationError({'message':'Product already exists.'})
            product_data = {
                'category' : category,
                'name' : name,
                'description' : description,
                'price' : price,
                'quantity' : quantity,
                'old_price' : old_price,
                'available' : available,
                'featured' : featured,
                'image' : image,
            }
            product = repo.create(data=product_data)
            return Response(ProductSerializer(product).data,status=status.HTTP_201_CREATED)
        return Response({'message':serializer.errors},status=status.HTTP_400_BAD_REQUEST)
    
class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsStoreOwner]
    queryset = repo.get_all()
    lookup_field = 'pk'
    serializer_class = ProductSerializer

    def put(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = ProductSerializer(instance,data=request.data,partial=True)
        if serializer.is_valid(raise_exception=True):
            updated_product = repo.update(product=instance,data=serializer.validated_data)
            return Response(ProductSerializer(updated_product).data,status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

class ProductDetailBySlugView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsStoreOwner]
    queryset = repo.get_all()
    lookup_field = 'slug'
    serializer_class = ProductSerializer 
