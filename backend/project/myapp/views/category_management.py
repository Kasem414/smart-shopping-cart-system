from django.forms import ValidationError
from rest_framework import generics, status
from rest_framework.response import Response
from ..repositories.category_repo import CategoryRepository
from ..models import Category
from ..serializers.category_management import CategorySerializer
from ..permissions import IsStoreOwner
from rest_framework.permissions import AllowAny,IsAuthenticated


class CategoryListView(generics.ListAPIView):
    queryset = CategoryRepository.get_all()
    permission_classes = [AllowAny]
    serializer_class = CategorySerializer


class CategoryCreateView(generics.CreateAPIView):
    permission_classes = [IsStoreOwner]
    serializer_class = CategorySerializer
    def post(self, request, *args, **kwargs):
        category_data=request.data.copy()
        category_data.pop('csrfmiddlewaretoken',None)
        serializer=self.serializer_class(data=category_data)
        if serializer.is_valid(raise_exception=True):
            name = serializer.validated_data['name']
            slug = serializer.validated_data['slug']
            if Category.objects.filter(name=name).exists():
                raise ValidationError({'message':'Category already exists.'})
            category_data = {
                'name' : name,
                'slug' : slug
            }
            category = CategoryRepository.create(category_data=category_data)
            return Response(CategorySerializer(category).data,status=status.HTTP_201_CREATED)
        return Response({'message':serializer.errors},status=status.HTTP_400_BAD_REQUEST)
    
class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsStoreOwner]
    queryset = CategoryRepository.get_all()
    lookup_field = 'pk'
    serializer_class = CategorySerializer

class CategoryDetailBySlugView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CategoryRepository.get_all()
    lookup_field = 'slug'
    serializer_class = CategorySerializer 
