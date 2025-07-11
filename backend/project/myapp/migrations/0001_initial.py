# Generated by Django 5.1.1 on 2024-10-26 12:28

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='MyUser',
            fields=[
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('email', models.EmailField(max_length=60, unique=True, verbose_name='email address')),
                ('first_name', models.CharField(max_length=30)),
                ('last_name', models.CharField(max_length=30)),
                ('creation_date', models.DateTimeField(auto_now_add=True)),
                ('date_of_birth', models.DateField(null=True)),
                ('profile', models.ImageField(default='../media/user_default_photo.jpg', upload_to='media/%y/%m/%d')),
                ('is_active', models.BooleanField(default=True)),
                ('is_staff', models.BooleanField(default=False)),
                ('is_superuser', models.BooleanField(default=False)),
                ('account_type', models.CharField(choices=[('system_owner', 'System Owner'), ('store_owner', 'Store Owner'), ('customer', 'Customer')], default='customer', max_length=30)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200, unique=True)),
                ('slug', models.SlugField(blank=True, max_length=200, unique=True)),
            ],
            options={
                'verbose_name': 'Category',
                'verbose_name_plural': 'Categories',
                'indexes': [models.Index(fields=['name'], name='myapp_categ_name_b18f9b_idx')],
            },
        ),
        migrations.CreateModel(
            name='Product',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200, unique=True)),
                ('slug', models.CharField(blank=True, max_length=200, unique=True)),
                ('description', models.TextField(blank=True, null=True)),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('quantity', models.IntegerField(default=0)),
                ('old_price', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('image', models.ImageField(blank=True, upload_to='media/%y/%m/%d')),
                ('available', models.BooleanField(default=True)),
                ('featured', models.BooleanField()),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='products', to='myapp.category')),
            ],
            options={
                'verbose_name': 'Product',
                'verbose_name_plural': 'Products',
                'indexes': [models.Index(fields=['name'], name='myapp_produ_name_2e356a_idx'), models.Index(fields=['-created'], name='myapp_produ_created_9680fb_idx')],
            },
        ),
    ]
