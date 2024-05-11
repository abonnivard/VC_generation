from .models import PairKeyStorage
from accounts.models import Issuer
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required

@login_required
def generate_key(request):
    """
    Vue pour générer une nouvelle paire de clés.
    """
    if request.method == "POST":
        issuer = Issuer.objects.get(username=request.user.username)
        name = request.POST.get('name')
        type = request.POST.get('keyType')
        # Générer une paire de clés ECDSA
        private_key_pem, public_key_pem = PairKeyStorage.generate_keys(key_type=type)

        # Enregistrer les clés dans la base de données
        PairKeyStorage.objects.create(
            issuer=issuer,
            private_key=private_key_pem,
            public_key=public_key_pem,
            name=name,
            key_type=type,
        )

    return redirect('/dashboard-signing')


@login_required
def delete_key(request, id):
    """
    Vue pour supprimer une paire de clés.
    """
    key = PairKeyStorage.objects.get(uuid=id)
    key.delete()
    return redirect('/dashboard-signing')


def add_key(request):
    """
    Vue pour ajouter une paire de clés.
    """
    if request.method == 'POST':
        name = request.POST.get('name')
        public_key = request.POST.get('public-key')
        private_key = request.POST.get('private-key')
        new_key = PairKeyStorage(name=name, public_key=public_key, private_key=private_key, issuer=Issuer.objects.get(username=request.user.username))
        new_key.save()
        return redirect('/dashboard')  # Redirigez vers la page de tableau de bord après l'enregistrement

    return render(request, "key_storage/add_key.html")
