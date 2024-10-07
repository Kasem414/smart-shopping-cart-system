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
class SignUpView(APIView):
    serializer_class=SignUpSerializer
    permission_classes=[AllowAny]
    def post(self, request=Request):
        data=request.data
        serializer=self.serializer_class(data=data)
        if serializer.is_valid():
            serializer.save()
            response={"message":"user was created successfully","data":serializer.data}
            return Response(data=response,status=status.HTTP_201_CREATED)
        return Response({'message':serializer.errors},status=status.HTTP_400_BAD_REQUEST)
# class LoginView(APIView):
#     serializer_class = LoginSerializer
#     def post(self,request):
#         username = request.data["email"]
#         password = request.data["password"]
#         user = authenticate(username=username,password=password)
#         if user is not None:
#             if user.is_active and user.account_type=='store_owner':
#                 refresh = RefreshToken.for_user(user)
#                 return Response({
#                     'refresh' : str(refresh),
#                     'access': str(refresh.access_token)
#                 })
#             else:
#                 return Response({"error":"Account is inactive or not authorized"},status=status.HTTP_401_UNAUTHORIZED)
#         else:
#             return Response({"error":"Invalid credentials"},status=status.HTTP_401_UNAUTHORIZED)

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
        return Response({'user':user_data,"access_token": str(access_token)})