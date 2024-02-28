from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from accounts.models import Issuer, Holder
from signing.models import UniversityDegree
import requests
from django.shortcuts import render
from django.http import JsonResponse
from key_storage.models import PrivateKey, JWTsignature


@login_required
def dashboard(request):
    # TODO : Récupérer les informations de l'utilisateur relatives à ses VC (faire un cas par type de VC)
    user = Holder.objects.get(username=request.user.username)
    degrees = UniversityDegree.objects.all().filter(user_uuid=user.uuid)
    context = {
        'degrees': degrees
    }

    # TODO rajouter un champ pour voir le VC en question
    return render(request, "VC_interface/dashboard.html", context)

@login_required
def signing_page(request, id):
    issuer = Issuer.objects.get(username=request.user.username)
    vc = UniversityDegree.objects.get(uuid=id)
    holder = Holder.objects.get(uuid=vc.user_uuid)

    issuer_private_key = PrivateKey.objects.all().filter(issuer=issuer)
    if issuer_private_key != []:
        key = True
    else:
        key = False

    if request.method == "POST" and key == True:
        private_key_id = request.POST.get('private-key-select')
        private_key = PrivateKey.objects.get(uuid=private_key_id).private_key
        method = request.POST.get('signature-select')
        print(method)


        year_of_graduation = vc.year_of_graduation
        university = vc.institution
        degree = vc.degree

        if method == "bss":

            data_to_sign = {
                "@context": [
                    "https://www.w3.org/2018/credentials/v1",
                ],
                "type": ["VerifiableCredential", "UniversityDegreeCredential"],
                "issuer": "https://www.telecom-sudparis.eu/",  # Mettre l'URL du site web de l'école comme émetteur
                "issued": "2024-02-19T12:00:00Z",
                "credentialSubject": {
                    "id": "did:example:123",
                    "degree": degree,
                    "university": university,
                    "year_of_graduation": year_of_graduation,
                }
            }
            data = {
                "data_to_sign": data_to_sign,
                "private_key": private_key,
                "issuer_uuid": str(issuer.uuid),
                "issuer_did": issuer.did
            }

            api_url = 'http://localhost:3000/bss/sign-vc/'  # Mettez l'URL correcte de votre API FastAPI
            payload = data
            print(payload)
            response = requests.post(api_url, json=payload)

        elif method == "jwt":
            data_to_sign = {
                "iss": "https://www.telecom-sudparis.eu/",
                "sub": holder.did,
                "iat": "undefined",
                'urn:example:claim': 'true',
                "credentialSubject": {
                    "name": vc.first_name + " " + vc.name,
                    "degree": degree,
                    "university": university,
                    "year_of_graduation": year_of_graduation,
                }
            }
            data = {
                "data_to_sign": data_to_sign,
                "private_key": private_key,
                "issuer_uuid": str(issuer.uuid),
                "issuer_did": issuer.did
            }

            api_url = 'http://localhost:3000/jwt/sign-vc/'
            response = requests.post(api_url, json=data)


        if response.status_code == 200:
            signed_vc = response.json()
            print(signed_vc)
            new = JWTsignature(
                jwt = signed_vc.get('signed_vc'),
                user_uuid = vc.user_uuid,
            )
            new.save()
            vc.status = "signed"
            vc.save()
            return redirect('/dashboard-signing')
        else:
            return JsonResponse({'error': 'Failed to sign VC'}, status=500)

    if key == False:
        context = {
            'vc': vc,
            'issuer_private_key': 'null',
        }
    else:
        context = {
            'vc': vc,
            'issuer_private_key': issuer_private_key
        }
    return render(request, "VC_interface/signing_page.html", context)




@login_required
def dashboard_signing(request):
    issuer = Issuer.objects.get(username=request.user.username)
    notsigning = UniversityDegree.objects.filter(status="unsigned", institution=issuer.institution)
    signing = UniversityDegree.objects.filter(status="signed", institution=issuer.institution)
    private_keys = PrivateKey.objects.filter(issuer=issuer)

    context = {
        'notsigning': notsigning,
        'signing': signing,
        'private_keys': private_keys,
    }


    return render(request, "VC_interface/dashboard_signing.html", context)

