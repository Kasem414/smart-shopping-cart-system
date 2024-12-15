from rest_framework.views import APIView
from rest_framework.response import Response
from ..permissions import IsCustomer
from rest_framework import status
from ..models import StoreLayout
from ..serializers.layout_management import StoreLayoutSerializer
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny
class StoreLayoutVisualizeView(APIView):
    permission_classes = [AllowAny]
    def get(self,request,store_id):
        """
        Retrieve the store layout data for the given store
        """
        layout = get_object_or_404(StoreLayout,store_id=store_id)
        serializer = StoreLayoutSerializer(layout)
        return Response(serializer.data,status=status.HTTP_200_OK)