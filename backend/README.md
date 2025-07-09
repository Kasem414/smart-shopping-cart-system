# Smart Shopping Cart System - Backend

## Overview

This is the backend component of the Smart Shopping Cart System, a comprehensive solution designed to modernize the shopping experience. The backend is built with Django and Django REST Framework, providing a robust API for the frontend application and mobile clients.

## Features

- **User Authentication & Authorization**: JWT-based authentication system with role-based access control (System Owner, Store Owner, Customer)
- **Store Management**: Create and manage stores with customizable layouts
- **Product Management**: Comprehensive product catalog with categories and attributes
- **Media Handling**: Support for product images and store logos
- **RESTful API**: Well-documented API endpoints for all system functionalities

## Technology Stack

- **Framework**: Django 5.x with Django REST Framework
- **Authentication**: JWT (JSON Web Tokens) via djangorestframework-simplejwt
- **Database**: MySQL
- **Documentation**: Swagger/OpenAPI via drf-yasg
- **Image Processing**: Pillow

## Prerequisites

- Python 3.8 or higher
- MySQL Server
- pip (Python package manager)

## Installation & Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd smart-shopping-cart/backend
   ```

2. Create and activate a virtual environment (recommended):

   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Configure the database in `project/project/settings.py`:

   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.mysql',
           'NAME': 'porject_spu_db',  # Your database name
           'USER': 'admin1',          # Your database username
           'PASSWORD': '1234',        # Your database password
           'HOST': 'localhost',       # Database host
           'PORT': '3306',            # Database port
       }
   }
   ```

5. Run migrations:

   ```bash
   cd project
   python manage.py migrate
   ```

6. Create a superuser:

   ```bash
   python manage.py createsuperuser
   ```

7. Start the development server:
   ```bash
   python manage.py runserver
   ```

## API Documentation

### Authentication Endpoints

- `POST /api/token/`: Obtain JWT token pair (access and refresh tokens)

  - Request body: `{"email": "user@example.com", "password": "userpassword"}`
  - Response: `{"access": "access_token", "refresh": "refresh_token"}`

- `POST /api/token/refresh/`: Refresh access token
  - Request body: `{"refresh": "refresh_token"}`
  - Response: `{"access": "new_access_token"}`

### User Management

The system supports multiple user roles:

- System Owner: Has full access to the system
- Store Owner: Can manage their stores and products
- Customer: Can browse products and manage their shopping cart

### Swagger Documentation

Interactive API documentation is available at `/swagger/` when the server is running.

## Project Structure

```
backend/
├── project/                  # Main Django project directory
│   ├── media/                # Media files (images, etc.)
│   ├── myapp/                # Main application
│   │   ├── api/              # API views and URLs
│   │   ├── migrations/       # Database migrations
│   │   ├── models.py         # Data models
│   │   ├── serializers/      # DRF serializers
│   │   ├── views/            # View functions
│   │   └── ...               # Other app files
│   ├── project/              # Project settings
│   │   ├── settings.py       # Django settings
│   │   ├── urls.py           # Main URL configuration
│   │   └── ...               # Other project files
│   └── manage.py             # Django management script
└── requirements.txt          # Python dependencies
```

## Development

### Adding New Features

1. Create models in `myapp/models.py`
2. Create serializers in `myapp/serializers/`
3. Create views in `myapp/views/` or `myapp/api/views.py`
4. Add URL patterns in `myapp/urls.py` or `myapp/api/urls.py`

### Running Tests

```bash
python manage.py test
```

## Deployment

For production deployment:

1. Set `DEBUG = False` in `settings.py`
2. Configure a production-ready database
3. Set up a proper web server (Nginx, Apache) with WSGI
4. Configure static and media files serving
5. Set up proper security measures (HTTPS, secure cookies, etc.)

## License

[Specify your license here]

## Contributors

[List of contributors]
