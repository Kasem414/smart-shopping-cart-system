# from rest_framework import generics, status
# from rest_framework.response import Response
# from ..models import Store
# from ..serializers.store_management import StoreSerializer
# from rest_framework.permissions import AllowAny,IsAuthenticated
# from rest_framework.serializers import ValidationError

# class StoreUpdateView(generics.UpdateAPIView):
#     queryset = Store.objects.all()
#     lookup_field = 'pk'
#     serializer_class = StoreSerializer
# class StoreListView(generics.ListAPIView):
#     queryset = Store.objects.all()
#     serializer_class = StoreSerializer