from rest_framework import serializers 
from ..models import MyUser
from rest_framework.serializers import ModelSerializer
from django.contrib.auth import authenticate,get_user_model

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyUser
        fields=['email','password']
class SignUpSerializer(serializers.ModelSerializer):
    email=serializers.EmailField(max_length=60)
    password = serializers.CharField(write_only=True,min_length=8)
    date_of_birth=serializers.DateField()
    class Meta:
        model = MyUser
        fields=['id','email','password','first_name','last_name','date_of_birth','profile','account_type']
        extra_kwargs = {
            'first_name' : {'required' : True},
            'last_name' : {'required' : True},
            'account_type' : {'required' : True}
        }
        def create(self, validated_data):
            email = validated_data.get('email')
            if MyUser.objects.filter(email=email).exists():
                raise serializers.ValidationError({'message':'Email already exists.'})
            password = validated_data.pop("password")
            user =MyUser(validated_data)
            user.set_password(password)
            print(f"Hashed Password:",{user.password})
            user.save()
            return user

class LoginSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True,write_only=True)
    class Meta:
        model = MyUser
        fields=['email','password']
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        User = get_user_model()
        user = authenticate(request=self.context.get('request'),email=email,password=password)
        if user is None:
            raise serializers.ValidationError('Invalid email or password.')
        attrs['user'] = user
        return attrs
