from django.urls import path
from .views import generate_key, add_key, delete_key

app_name = 'key_storage'

urlpatterns = [
    path('generate_key/', generate_key, name="generate_key"),
    path('delete_key/<str:id>/', delete_key, name="delete_key"),
    path('add_key/', add_key, name="add_key"),
]
