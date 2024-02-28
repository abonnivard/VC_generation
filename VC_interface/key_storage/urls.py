from django.urls import path
from .views import generate_key

app_name = 'key_storage'

urlpatterns = [
    path('generate_key/', generate_key, name="generate_key"),
]
