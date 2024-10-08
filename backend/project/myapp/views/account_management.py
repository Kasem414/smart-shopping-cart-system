from rest_framework_simplejwt.tokens import RefreshToken,AccessToken
from rest_framework import status,generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny,IsAuthenticated,IsAdminUser
from ..serializers.account_management import SignUpSerializer,LoginSerializer,UserSerializer,StoreOwnerSeializer
from rest_framework.authentication import TokenAuthentication,SessionAuthentication
from ..models import MyUser
from rest_framework.request import Request
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
        password = request.data['password']
        confirmation_password = request.data['confirmation_password']
        if password != confirmation_password:
            return Response({'title':'Failed Registration','message': 'password and confirmation password doesnt match'}, status=status.HTTP_400_BAD_REQUEST)
        clean_data = {
                        'email': request.data['email'],
                        'password': request.data['password'],
                        'first_name': request.data['first_name'],
                        'last_name': request.data['last_name'],
                        'date_of_birth': request.data['date_of_birth'],
                        'account_type': request.data['account_type'],
        }
        serializer=self.serializer_class(data=clean_data)
        if serializer.is_valid(raise_exception=True):
            user=serializer.save()
            token= get_token_for_user(user)
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


