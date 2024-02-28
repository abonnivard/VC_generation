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
from django.urls import path, include
from .views import dashboard, dashboard_signing, signing_page

app_name = 'VC_interface'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('accounts.urls')),
    path('', include('signing.urls')),
    path('', include('key_storage.urls')),
    path('', include('key_informations.urls')),
    path('dashboard/', dashboard, name='dashboard'),
    path('dashboard-signing/', dashboard_signing, name='dashboard_signing'),
    path('signing_page/id=<str:id>/', signing_page, name='signing_page'),


]
