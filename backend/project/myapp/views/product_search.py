from django.db import connection
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..models import Product
from ..serializers.product_search import ProductSearchSerializer

class ProductSearchView(APIView):
    def get(self,request,*args, **kwargs):
        query = request.query_params.get('query','').strip()
        if not query:
            return Response({"message": "Please ente a valid search term."},status=status.HTTP_400_BAD_REQUEST)
        results = Product.objects.raw("SELECT * FROM myapp_product WHERE MATCH(name,description) AGAINST (%s IN NATURAL LANGUAGE MODE)",[query])
        if not results and len(query) < 4:
            results = Product.objects.filter(Q(name__icontains=query) | Q(description__icontains=query) | Q(category__name__icontains=query))
        if not results:
            return Response({"message": "No products match the search criteria."},status=status.HTTP_404_NOT_FOUND)
        serializer = ProductSearchSerializer(results,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)