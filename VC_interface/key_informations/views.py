from django.shortcuts import render
from django.http import JsonResponse
from accounts.models import Issuer

def key_detail(request, key_id):
    issuer = Issuer.objects.get(uuid=key_id)
    print(issuer)
    context = {
        "issuer":issuer
    }
    return render(request, 'key_informations/key_detail.html', context)

def issuer_detail(request, issuer_id):
    issuer = Issuer.objects.get(uuid=issuer_id)
    context = {
        "issuer": issuer
    }
    return render(request, 'key_informations/issuer_detail.html', context)
