from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..models import Store, StoreLayout
from ..serializers.layout_management import StoreLayoutSerializer
from django.shortcuts import get_object_or_404
from ..permissions import IsStoreOwner
from rest_framework.permissions import AllowAny,IsAuthenticated

class StoreLayoutView(APIView):
    def get(self,request):
        # Fetch the store layout for the logged-in store owner
        store = self.request.user.managed_stores.first() # Assuming the user has a related store
        layout = get_object_or_404(StoreLayout,store=store)
        # Serialize the layout with its components 
        serializer = StoreLayoutSerializer(layout)
        return Response(serializer.data,status=status.HTTP_200_OK)
    # def post(self,request):
    #     store = get_object_or_404(Store,store_owner=self.request.user)
    #     if StoreLayout.objects.filter(store=store).exists():
    #         return Response({"detail":"Layout already exists. Use PUT to update it."},status=status.HTTP_400_BAD_REQUEST)
    #     serializer = StoreLayoutSerializer(data=request.data)
    #     if serializer.is_valid():  
    #         layout = serializer.save(store=store)
    #         return Response(serializer.data,status=status.HTTP_201_CREATED)
    #     return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    def put(self, request):
        store = get_object_or_404(Store, store_owner=request.user)
        layout, _ = StoreLayout.objects.get_or_create(store=store)

        serializer = StoreLayoutSerializer(layout, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        store = get_object_or_404(Store, store_owner=request.user)
        layout = get_object_or_404(StoreLayout, store=store)
        layout.delete()
        return Response({"message": "Layout deleted successfully."}, status=status.HTTP_200_OK)