from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser,PermissionsMixin

class MyUserManager(BaseUserManager):
    def create_user(self, email, password=None,**extra_fields):
        """
        Creates and saves a User with the given email, 
        first_name, last_name and password.
        """
        if not email:
            raise ValueError("Users must have an email address")

        user = self.model(
            email=self.normalize_email(email),
            **extra_fields
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None,**extra_fields):
        """
        Creates and saves a superuser with the given email, and password.
        """
        user = self.create_user(
            email,
            password=password,
            **extra_fields
        )
        user.is_staff = True
        user.is_superuser = True
        user.account_type = 1
        user.save(using=self._db)
        return user

class MyUser(AbstractBaseUser,PermissionsMixin):
    id = models.AutoField(primary_key=True)
    email = models.EmailField(
        verbose_name="email address",
        max_length=60,
        unique=True,
    )
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    creation_date = models.DateTimeField(auto_now_add=True)
    date_of_birth = models.DateField(null=True)
    profile = models.ImageField(upload_to='media/%y/%m/%d',default='../media/user_default_photo.jpg')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    ROLE_CHOICES =(
        ("system_owner","System Owner"),
        ("store_owner","Store Owner"),
        ("customer","Customer"),
    )
    account_type = models.CharField(max_length=30,choices=ROLE_CHOICES,default="customer")
    USERNAME_FIELD = "email"
    objects = MyUserManager()

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        return self.is_superuser

    def has_module_perms(self, app_label):
        return self.is_superuser