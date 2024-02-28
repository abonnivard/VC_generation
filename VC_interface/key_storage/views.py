from .models import PrivateKey
from accounts.models import Issuer
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required

@login_required
def generate_key(request):
    if request.method == "POST":
        issuer = Issuer.objects.get(username=request.user.username)
        name = request.POST.get('name')

        # Générer une paire de clés RSA
        private_key_bytes, public_key_bytes = PrivateKey.generate_rsa_keys()

        # Enregistrer les clés dans la base de données
        PrivateKey.objects.create(issuer=issuer, private_key=private_key_bytes.decode('utf-8'), public_key=public_key_bytes.decode('utf-8'), name=name)

    return redirect('/dashboard-signing')
