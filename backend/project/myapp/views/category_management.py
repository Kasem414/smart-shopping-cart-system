from rest_framework import generics, status
from rest_framework.response import Response
from ..repositories.category_repo import CategoryRepository
from ..models import Category
from ..serializers import CategorySerializer
from ..permissions import IsStoreOwner


class CategoryCreateView(generics.CreateAPIView):
    permission_classes = [IsStoreOwner]
    serializer_class = CategorySerializer
    def post(self, request, *args, **kwargs):
        category_data = request.data
        category = CategoryRepository.create(category_data=category_data)
        return Response(CategorySerializer(category).data,status=status.HTTP_201_CREATED)

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CategoryRepository.get_all()
    lookup_field = 'id'
    serializer_class = CategorySerializer

class CategoryDetailBySlugView(generics.RetrieveAPIView):
    queryset = CategoryRepository.get_all()
    lookup_field = 'slug'
    serializer_class = CategorySerializer 
