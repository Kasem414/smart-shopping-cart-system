from rest_framework import serializers 
from ..models import MyUser
from rest_framework.serializers import ModelSerializer
from django.contrib.auth import authenticate,get_user_model
from ..validations import validate_password_complexity
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
    def __init__(self, instance=None, data=..., **kwargs):
        super().__init__(instance, data, **kwargs)
        self.fields['account_type'].choices = [
            ('store_owner','Store Owner'),
            ('customer','Customer')
            ]
    def validate_account_type(self,value):
        if value == 'system_owner':
            raise serializers.ValidationError("You cannot create a system owner through this form.")
        return value
    def create(self, validated_data):
            
        email = validated_data.get('email')
        if MyUser.objects.filter(email=email).exists():
            raise serializers.ValidationError({'message':'Email already exists.'})
        password = validated_data.pop("password")
        user =MyUser(**validated_data)
        user.set_password(password)
        user.save()
        return user
    def validate_password(self,value):
        validate_password_complexity(value)
        return value
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
class StoreOwnerSeializer(serializers.ModelSerializer):
    class Meta:
        model = MyUser
        fields=['id','email','first_name','last_name','date_of_birth','profile','account_type']

class CustomerSeializer(serializers.ModelSerializer):
    class Meta:
        model = MyUser
        fields=['id','email','first_name','last_name','date_of_birth','profile','account_type']