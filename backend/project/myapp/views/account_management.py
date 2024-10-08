from rest_framework_simplejwt.tokens import RefreshToken,AccessToken
from rest_framework import status,generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny,IsAuthenticated,IsAdminUser
from ..serializers.account_management import SignUpSerializer,LoginSerializer,UserSerializer
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
        serializer=self.serializer_class(data=request.data)
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