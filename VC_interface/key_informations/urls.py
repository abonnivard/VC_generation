from django.urls import path
from .views import key_detail, issuer_detail

urlpatterns = [
    path('key_details/key_id=<str:key_id>/', key_detail, name='key_detail'),
    path('issuer_details/issuer_id=<str:issuer_id>/', issuer_detail, name='issuer_detail'),
]
