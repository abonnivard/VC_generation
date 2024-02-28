"""
URL configuration for VC_interface project.

The `urlpatterns` list bss_signature URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from .views import login_function, register_holder, register_issuer, logout_view

app_name = 'accounts'

urlpatterns = [
    path('', login_function, name="login"),
    path('register-issuer/', register_issuer, name='register-issuer'),
    path('register-holder/', register_holder, name='register-holder'),
    path('logout/', logout_view, name='logout'),
]
