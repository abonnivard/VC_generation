from django.shortcuts import render, redirect
from accounts.models import Issuer, Holder
from key_storage.models import PairKeyStorage
from .models import UniversityDegree
from django.http import HttpResponse
import json
def generate_did_web(request, id):
    issuer = Issuer.objects.get(uuid=id)
    pairkey = PrivateKey.objects.get(issuer=issuer)


    # Définition du contexte
    context = [
        "https://www.w3.org/ns/did/v1",
        "https://w3id.org/security/suites/jws-2020/v1"
    ]

    # Définition de la clé publique
    public_key_jwk = pairkey.ec_key_info

    # Définition de la méthode de vérification
    verification_method = {
        "id": "did:web:telecom-sudparis.eu#owner",
        "type": "JsonWebKey2020",
        "controller": "did:web:telecom-sudparis.eu",
        "publicKeyJwk": public_key_jwk
    }

    # Construction de l'objet DID Web
    did_web = {
        "@context": context,
        "id": "did:web:telecom-sudparis.eu",
        "verificationMethod": [verification_method],
        "authentication": ["did:web:telecom-sudparis.eu#owner"],
        "assertionMethod": ["did:web:telecom-sudparis.eu#owner"]
    }

    did_web_json_str = json.dumps(did_web, indent=2)

    # Retourner la réponse HTTP avec la chaîne JSON bien formatée
    return HttpResponse(did_web_json_str, content_type="application/json")


def university_degree(request):
    if request.method == "POST":
        institution = request.POST.get('institution')
        year_of_graduation = request.POST.get('year')
        first_name = request.POST.get('firstname')
        name = request.POST.get('name')
        degree = request.POST.get('degree')
        user = Holder.objects.get(username=request.user.username)
        university_degree = UniversityDegree(
            user_uuid=user.uuid,
            institution=institution,
            year_of_graduation=year_of_graduation,
            first_name=first_name,
            name=name,
            degree=degree,
        )
        university_degree.save()

        return redirect("/dashboard")

    #On cherche a avoir la liste des institutions
    issuers = Issuer.objects.all()
    list_institutions = []
    for issuer in issuers:
        if issuer.institution not in list_institutions:
            list_institutions.append(issuer.institution)
    context = {
        'institutions': list_institutions,

    }
    return render(request, "signing/university_degree.html", context)


def example_vc_universitydegree(request):
    # Créez un exemple de VC
    example_vc = {
        "@context": ["http://127.0.0.1:8000/universitydegree/example"],
        "id": 1,
        "type": ["VerifiableCredential", "UniversityDegreeCredential"],
        "issuer": "https://www.example.com/issuer",
        "issuanceDate": "2024-02-20T10:00:00Z",
        "credentialSubject": {
            "id": 1,
            "degree": "Bachelor of Science",
            "university": {
            "id": "https://example.edu/credentials/565049",
            "name": "Example University"
        },
            "year_of_graduation": "2023-01-20T08:00:00Z"
        }
    }

    response = json.dumps(example_vc, indent=2)

    # Retourner la réponse HTTP avec la chaîne JSON bien formatée
    return HttpResponse(response, content_type="application/json")

