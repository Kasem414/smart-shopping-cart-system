from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..models import Store, StoreLayout
from ..serializers.layout_management import StoreLayoutSerializer
from django.shortcuts import get_object_or_404

class StoreLayoutView(APIView):
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