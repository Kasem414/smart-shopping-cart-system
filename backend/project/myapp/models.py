from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser,PermissionsMixin
from io import BytesIO
from PIL import Image
from django.core.files import File
from django.utils.text import slugify
from django.conf import settings
from django.utils import timezone
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


class Store(models.Model):
    name = models.CharField(max_length=200)
    logo = models.ImageField(upload_to='media/%y/%m/%d',blank=True,null=True)
    store_owner = models.ManyToManyField(settings.AUTH_USER_MODEL,related_name="managed_stores",blank=True)
    def get_image(self):
        if self.logo:
            return 'http://127.0.0.1:8000' + self.logo.url
    def __str__(self):
        return self.name 

class Category(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200,blank=True)
    image = models.ImageField(upload_to='media/%y/%m/%d',null=True,blank=True)
    store_id = models.ForeignKey(Store,related_name="categories",on_delete=models.CASCADE)
    class Meta:
        indexes = [
            models.Index(fields=['name']),
            ]
        constraints = [
            models.UniqueConstraint(fields=['name','store_id'],name='unique_category_per_store')
        ]
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'

    def save(self,*args, **kwargs):
        self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
    def get_image(self):
        if self.image:
            return 'http://127.0.0.1:8000' + self.image.url

class Product(models.Model):
    category = models.ForeignKey(Category,related_name='products',on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    slug = models.CharField(max_length=200,blank=True)
    description = models.TextField(blank=True,null=True)
    price = models.DecimalField(max_digits=10,decimal_places=2)
    quantity = models.IntegerField(default=0)
    old_price = models.DecimalField(max_digits=10,decimal_places=2,null=True,blank=True)
    image = models.ImageField(upload_to='media/%y/%m/%d',blank=True)
    available = models.BooleanField(default=True)
    featured = models.BooleanField()
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    store_id = models.ForeignKey(Store,related_name="products",on_delete=models.CASCADE)
    class Meta:
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['-created']),
            ]
        constraints = [
            models.UniqueConstraint(fields=['name','store_id'],name='unique_product_per_store')
        ]
        verbose_name = "Product"
        verbose_name_plural = "Products"

    def save(self,*args, **kwargs):
            self.slug = slugify(self.name)
            super().save(*args, **kwargs)
    def __str__(self):
        return self.name

    def get_image(self):
         if self.image:
            return 'http://127.0.0.1:8000' + self.image.url
# class ProductImage(models.Model):
#     product = models.ForeignKey(Product,related_name='images',on_delete=models.CASCADE)
#     image = models.ImageField(upload_to='media/%y/%m/%d',blank=True)


class ShoppingList(models.Model):
    customer = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name="shopping_lists")
    name = models.CharField(max_length=255,null=True,blank=True)
    created_at = models.DateTimeField(auto_now_add=True) 
    @property
    def total_cost(self):
        # Calculate the total price for all items in the list
        return sum(item.quantity * item.product.price for item in self.items.all())
    def __str__(self):
        return f"{self.name} - {self.customer.first_name}"
class ShoppingListItem(models.Model):
    shopping_list = models.ForeignKey(ShoppingList,on_delete=models.CASCADE,related_name="items")
    product = models.ForeignKey(Product,on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    picked_up = models.BooleanField(default=False)
    @property
    def total_price(self):
        return self.product.price * self.quantity
    def __str__(self):
        return f"{self.product.name} (x{self.quantity}) - {'Picked Up' if self.picked_up else 'Not Picked Up'}"


class StoreLayout(models.Model):
    store = models.OneToOneField(Store, on_delete=models.CASCADE, related_name='layout')
    grid_size = models.PositiveIntegerField(default=50)
    last_modified = models.DateTimeField(auto_now=True)

class Component(models.Model):
    layout = models.ForeignKey(StoreLayout, on_delete=models.CASCADE, related_name='components')
    component_id = models.BigIntegerField()
    type = models.CharField(max_length=50)
    position_x = models.PositiveIntegerField()
    position_y = models.PositiveIntegerField()
    width = models.PositiveIntegerField()
    height = models.PositiveIntegerField()
    categories = models.JSONField(default=list)  # Storing categories as an array of strings
    rotation = models.DecimalField(max_digits=17,decimal_places=14) 
    