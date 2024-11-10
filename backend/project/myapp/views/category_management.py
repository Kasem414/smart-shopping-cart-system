from rest_framework import generics, status
from rest_framework.response import Response
from ..repositories.category_repo import CategoryRepository
from ..models import Category
from ..serializers.category_management import CategorySerializer
from ..permissions import IsStoreOwner
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.serializers import ValidationError
from rest_framework.exceptions import PermissionDenied

class CategoryListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = CategorySerializer
    def get_queryset(self):
        if self.request.user.is_anonymous or self.request.user.account_type == 'customer':
            quereyset = CategoryRepository.get_category_by_store(store_id=1)
            return quereyset
        store = self.request.user.managed_stores.first()
        # Filter categories by the store to restrict access
        return Category.objects.filter(store_id=store.id)


class CategoryCreateView(generics.CreateAPIView):
    permission_classes = [IsStoreOwner]
    serializer_class = CategorySerializer
    def post(self, request, *args, **kwargs):
        category_data=request.data.copy()
        category_data.pop('csrfmiddlewaretoken',None)
        # Ensure the store owner is associated with a store
        if not hasattr(request.user,'managed_stores') or request.user.managed_stores.count() == 0:
            raise ValidationError({'detail': 'You do not have a store associated with your account.'})
        # Get the store owned by the user
        # Assuming a store owner has only one store 
        store = request.user.managed_stores.first()
        # Set the store_id for the category
        category_data['store_id'] = store.id
        # Check if category with same name exists in the store
        name = category_data.get('name')
        if Category.objects.filter(name=name,store_id=store.id).exists():
            raise ValidationError({'message':'Category already exists for your store.'})
        serializer=self.serializer_class(data=category_data)
        if serializer.is_valid(raise_exception=True):
            # These lines for solving this: "Column store_id cannot be null"
            ###
            # Extract validated data and explicitly set store_id 
            validated_data = serializer.validated_data
            validated_data['store_id'] = store.id
            ###
            # To check if there an image in request
            if 'image' in request.FILES:
                category_data['image'] = request.FILES['image']
            category = CategoryRepository.create(category_data=validated_data)
            return Response(CategorySerializer(category).data,status=status.HTTP_201_CREATED)
        return Response({'message':serializer.errors},status=status.HTTP_400_BAD_REQUEST)
    
class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsStoreOwner]
    lookup_field = 'pk'
    serializer_class = CategorySerializer
    def get_queryset(self):
        if not hasattr(self.request.user,'managed_stores') or self.request.user.managed_stores.count() == 0:
            raise PermissionDenied({'detail': 'You do not have a store associated with your account.'})
        store = self.request.user.managed_stores.first()
        # Filter categories by the store to restrict access
        return Category.objects.filter(store_id=store.id)
    def update(self, request, *args, **kwargs):
        if not hasattr(self.request.user,'managed_stores') or self.request.user.managed_stores.count() == 0:
            raise PermissionDenied({'detail': 'You do not have a store associated with your account.'})
        store = self.request.user.managed_stores.first()
        # Copy request data and set the store_id to the user's store
        data = request.data.copy()
        # overwrite store_id to pervent errors
        data['store_id'] = store.id
        # Retrieve the existing category instance
        category = self.get_object()
        updated_category = CategoryRepository.update(category,data)
        return Response(CategorySerializer(updated_category).data,status=status.HTTP_200_OK)
class CategoryDetailBySlugView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsStoreOwner]
    queryset = CategoryRepository.get_all()
    lookup_field = 'slug'
    serializer_class = CategorySerializer 
