import logging
from rest_framework_simplejwt.tokens import RefreshToken,AccessToken
from rest_framework import status,generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny,IsAuthenticated,IsAdminUser
from ..serializers.account_management import SignUpSerializer,LoginSerializer,UserSerializer,StoreOwnerSeializer,CustomerSeializer
from ..models import MyUser,Store
from rest_framework.decorators import api_view
def get_token_for_user(user):
    refresh  = RefreshToken.for_user(user)
    return {
        'refresh' : str(refresh),
        'access'  : str(refresh.access_token),
    }
class SignUpView(APIView):
    serializer_class=SignUpSerializer
    permission_classes=[AllowAny]
    def post(self, request,fromat=None):
        data=request.data
        serializer=self.serializer_class(data=data)
        if serializer.is_valid(raise_exception=True):
            user=serializer.save()
            token= get_token_for_user(user)   
            if user.account_type == 'store_owner':
                store = Store.objects.create(name=f"{user.first_name}'s Store")
                store.store_owner.add(user)
                store.save()
                token['store_id'] = store.id
            response={"message":"user was created successfully","data":serializer.data,'token' :token}
            return Response(data=response,status=status.HTTP_201_CREATED)
        return Response({'message':serializer.errors},status=status.HTTP_400_BAD_REQUEST)

class LoginView(generics.GenericAPIView):
    queryset = MyUser.objects.all()
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        serializer =self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        access_token = AccessToken.for_user(user)
        user_data = UserSerializer(user).data
        user_data['account_type'] = user.account_type
        return Response({'user':user_data,"access_token": str(access_token)})

class StoreOwnerList(generics.ListAPIView):
    queryset = MyUser.objects.filter(account_type='store_owner')
    serializer_class = StoreOwnerSeializer
    permission_classes = [AllowAny]

class DeactivateUserView(APIView):
    permission_classes = [IsAdminUser]
    def post(self,request,*args, **kwargs):
        admin_user = request.user
        if not admin_user.is_authenticated:
            return Response({"deatail":"Not authenticated."},status=status.HTTP_401_UNAUTHORIZED)
        if not admin_user.is_superuser:
            return Response({"detail":"You don't hace permission to perform this action."},status=status.HTTP_403_FORBIDDEN)
        user_id = self.kwargs['id']
        user = MyUser.objects.get(id=user_id)
        try:
           if user.account_type == 'store_owner' or user.account_type == 'customer':
            user.is_active = False
            user.save()
            return Response({"message":'User has been deactivated'},status=status.HTTP_200_OK)
        except MyUser.DoesNotExist:
            return Response({"error":"User not found"},status=status.HTTP_404_NOT_FOUND)

class ActivateUserView(APIView):
    permission_classes = [IsAdminUser]
    def post(self,request,*args, **kwargs):
        admin_user = request.user
        if not admin_user.is_authenticated:
            return Response({"deatail":"Not authenticated."},status=status.HTTP_401_UNAUTHORIZED)
        if not admin_user.is_superuser:
            return Response({"detail":"You don't hace permission to perform this action."},status=status.HTTP_403_FORBIDDEN)
        user_id = self.kwargs['id']
        user = MyUser.objects.get(id=user_id)
        try:
           if user.account_type == 'store_owner' or user.account_type == 'customer':
            user.is_active = True
            user.save()
            return Response({"message":'User has been deactivated'},status=status.HTTP_200_OK)
        except MyUser.DoesNotExist:
            return Response({"error":"User not found"},status=status.HTTP_404_NOT_FOUND)

class ListCustomerView(generics.ListAPIView):
    queryset = MyUser.objects.filter(account_type="customer")
    serializer_class = CustomerSeializer
    permission_classes = [AllowAny]

@api_view(['GET'])
def get_current_user(request):
    if request.user.is_authenticated:
        user = request.user
        serializer = CustomerSeializer(user)
        return Response(serializer.data,status=status.HTTP_200_OK)
    else:
        return Response({"detail":"Authentication credintials were not provided."},status=status.HTTP_401_UNAUTHORIZED)