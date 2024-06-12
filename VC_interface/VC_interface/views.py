"""
Ce fichier Python contient des vues Django utilisées pour gérer l'interface utilisateur d'un système de signature de certificats vérifiables (VC).

Fonctions de Vue :
------------------

1. dashboard(request):
   - Affiche le tableau de bord de l'utilisateur.
   - Affiche les diplômes signés et non signés de l'utilisateur.
   - Rendu de la page VC_interface/dashboard.html.

2. signing_page(request, id):
   - Gère la page de signature d'un diplôme spécifique.
   - Prend en charge la signature d'un diplôme en utilisant différents algorithmes de signature (bbs, jwt, ld, zkp-cl).
   - Rendu de la page VC_interface/signing_page.html.

3. dashboard_signing(request):
   - Affiche le tableau de bord de signature de l'émetteur.
   - Affiche les diplômes à signer et les clés privées disponibles pour la signature.
   - Rendu de la page VC_interface/dashboard_signing.html.

4. generate_qr_code(request, vc_id):
   - Génère un code QR pour vérifier un VC.
   - Prend en charge la génération d'un code QR contenant un lien de vérification du VC.

5. verify_vc_jwt(request, id, title):
   - Vérifie un VC signé avec JWT.
   - Affiche les détails du VC si la vérification est réussie.
   - Rendu des pages VC_interface/VC_verify.html et VC_interface/VC_notverify.html.

6. verify_vc_bbs(request, id, title):
   - Vérifie un VC signé avec BBS+.
   - Affiche les détails spécifiques du VC en fonction de l'attribut révélé.
   - Rendu des pages VC_interface/VC_verify_institution.html, VC_interface/VC_verify_degree.html, VC_interface/VC_verify_year.html, VC_interface/VC_verify_student.html, VC_interface/VC_verify.html et VC_interface/VC_notverify.html.

7. check_session_number_for_verification(request, session_number):
   - Vérifie si un numéro de session existe pour la vérification.
   - Retourne une réponse JSON indiquant si le numéro de session existe.

8. check_session_number_for_signature(request, session_number):
   - Vérifie si un numéro de session existe pour la signature.
   - Retourne une réponse JSON indiquant si le numéro de session existe et est valide.

Imports Utilisés :
------------------

- render, redirect, HttpResponse, JsonResponse : Fonctions Django pour générer des réponses HTTP et rendre des pages HTML.
- login_required : Décorateur Django pour restreindre l'accès aux vues aux utilisateurs authentifiés.
- UniversityDegree, Issuer, Holder, SessionNumber, PairKeyStorage : Modèles Django utilisés pour accéder aux données de la base de données.
- requests : Module Python pour effectuer des requêtes HTTP.
- qrcode : Module Python pour générer des codes QR.
- json, jwt, time, datetime : Modules Python pour la manipulation de données JSON, la génération de JWT, et la gestion des dates et heures.
"""

from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from accounts.models import Issuer, Holder, SessionNumber
from signing.models import UniversityDegree
import requests
from django.http import JsonResponse
from key_storage.models import PairKeyStorage
from datetime import datetime
from django.http import HttpResponse
import qrcode
import json
import jwt
import time
import datetime
from datetime import datetime as dt

@login_required
def dashboard(request):
    """
    Affiche le tableau de bord de l'utilisateur.
    Affiche les diplômes signés et non signés de l'utilisateur.
    Rendu de la page VC_interface/dashboard.html.
    """
    user = Holder.objects.get(username=request.user.username)
    degrees_sign = UniversityDegree.objects.all().filter(user_uuid=user.uuid).filter(status="signed")
    degrees_unsigned = UniversityDegree.objects.all().filter(user_uuid=user.uuid).filter(status="unsigned")
    dico_signed = []
    for degree in degrees_sign:
        try:
            temp = {
                "vc": degree.signedvc,
                "uuid": degree.uuid,
            }
            dico_signed.append(temp)
        except:
            pass
    context = {
        'degrees_unsigned': degrees_unsigned,
        'degrees_signed': degrees_sign,
        "dico_signed": dico_signed,
    }

    return render(request, "VC_interface/dashboard.html", context)

@login_required
def signing_page(request, id):
    """
    Gère la page de signature d'un diplôme spécifique.
    Prend en charge la signature d'un diplôme en utilisant différents algorithmes de signature (bbs, jwt, ld, zkp-cl).
    Rendu de la page VC_interface/signing_page.html.
    """
    issuer = Issuer.objects.get(username=request.user.username)
    vc = UniversityDegree.objects.get(uuid=id)
    holder = Holder.objects.get(uuid=vc.user_uuid)

    issuer_private_key = PairKeyStorage.objects.all().filter(issuer=issuer)
    if issuer_private_key != []:
        key = True
    else:
        key = False

    if request.method == "POST" and key == True:
        private_key_id = request.POST.get('private-key-select')
        pairkey = PairKeyStorage.objects.get(uuid=private_key_id)
        private_key_str = pairkey.private_key
        public_key_str = pairkey.public_key

        method = request.POST.get('signature-select')
        current_date_time = dt.now()
        formatted_date_time = current_date_time.strftime("%Y-%m-%dT%H:%M:%SZ")

        year_of_graduation = vc.year_of_graduation
        university = vc.institution
        degree = vc.degree

        if method == "bbs":
            data_to_sign = {
                "@context": ["http://127.0.0.1:8000/universitydegree/example"],
                "id": int(vc.id),
                "type":
                    [ "VerifiableCredential", "UniversityDegreeCredential"],
                "issuer": public_key_str,
                "issuanceDate": formatted_date_time,
                "session_number": request.session.get('session_number'),
                "subject": vc.first_name + " " + vc.name,
                "credentialSubject": {
                    "id": int(vc.id),
                    "degree": vc.degree,
                    "university": {
                        "id": "https://www.telecom-sudparis.eu/",
                        "name": vc.institution,
                    },
                    "year_of_graduation": vc.year_of_graduation + "-01-01T00:00:00Z",
                }
            }

            data = {
                "data_to_sign": data_to_sign,
                "private_key": private_key_str,
                "public_key": public_key_str,
                "issuer_uuid": str(issuer.uuid),
                "issuer_did": issuer.did
            }

            # Enregistrement de numéro de session pour garantir que la requête provient de l'interface.
            if not SessionNumber.objects.filter(session_number=request.session.get('session_number')).exists():
                new_session = SessionNumber(user=issuer, session_number=request.session.get('session_number'))
                new_session.save()
            else:
                new_session = SessionNumber.objects.get(session_number=request.session.get('session_number'))

            api_url = 'http://localhost:3000/bss/sign-vc/'  # Mettez l'URL correcte de votre API FastAPI
            payload = data
            response = requests.post(api_url, json=payload)
            if response.status_code == 200:
                # On spécifie que la session a été utilisée pour signature
                new_session.used_for_signing = True
                new_session.save()
                signed_vc = response.json()

                vc.status = "signed"
                vc.bbs = True
                vc.key_uuid = pairkey.uuid
                vc.signedvc = signed_vc.get('signed_vc')
                vc.save()
                return redirect('/dashboard-signing')
            else:
                # Si la signature est réussie, on garde l'enregistrement de la session, sinon on le supprime
                a_supprimer = SessionNumber.objects.get(session_number=request.session.get('session_number'))
                if not a_supprimer.used_for_signing :
                    a_supprimer.delete()
                return JsonResponse({'error': 'Failed to sign VC'}, status=500)

        elif method == "jwt":

            data_to_sign = {
                "@context": [
                    "https://www.w3.org/2018/credentials/v1",
                    "http://127.0.0.1:8000/universitydegree/example"
                ],
                "type": ["VerifiableCredential", "UniversityDegreeCredential"],
                "sub": vc.first_name + " " + vc.name,
                "iss": public_key_str,
                "iat": time.time(),
                "id" : vc.id,
                "session_number" : request.session.get('session_number'),
                "credentialSubject": {
                    "name": vc.first_name + " " + vc.name,
                    "degree": degree,
                    "university": university,
                    "year_of_graduation": year_of_graduation,
                }
            }
            data = {
                "data_to_sign": data_to_sign,
                "private_key": private_key_str,
                "public_key": public_key_str,
            }

            # Si la signature est réussie, on enregistre le numéro de session utilisé au moment de la signature
            if not SessionNumber.objects.filter(session_number=request.session.get('session_number')).exists():
                new_session = SessionNumber(user=issuer, session_number=request.session.get('session_number'))
                new_session.save()
            else:
                new_session = SessionNumber.objects.get(session_number=request.session.get('session_number'))

            api_url = 'http://localhost:3000/jwt/sign-vc/'
            response = requests.post(api_url, json=data)
            if response.status_code == 200:

                # On spécifie que la session a été utilisée pour signature
                new_session.used_for_signing = True
                new_session.save()
                signed_vc = response.json()
                vc.status = "signed"
                vc.key_uuid = pairkey.uuid
                vc.signedvc = json.dumps(signed_vc.get('signed_vc'))
                vc.jwt = True
                vc.save()
                return redirect('/dashboard-signing')
            else:
                # Si la signature est réussie, on garde l'enregistrement de la session, sinon on le supprime
                a_supprimer = SessionNumber.objects.get(session_number=request.session.get('session_number'))
                if not a_supprimer.used_for_signing:
                    a_supprimer.delete()
                return JsonResponse({'error': 'Failed to sign VC'}, status=500)

        elif method=="ld":
            if not pairkey.key_type == "ed25519":
                raise ValueError("Invalid key type")

            print("ld")

            dataToSign = {
                "@context": ["https://w3id.org/security/v1",
                    ],
                "id": int(vc.id),
                "type":
                    ["VerifiableCredential", "UniversityDegreeCredential"],
                "issuer": public_key_str,
                "issuanceDate": formatted_date_time,
                "session_number": request.session.get('session_number'),
                "subject": vc.first_name + " " + vc.name,
                "credentialSubject": {
                    "id": int(vc.id),
                    "degree": vc.degree,
                    "university": {
                        "id": "https://www.telecom-sudparis.eu/",
                        "name": vc.institution,
                    },
                    "year_of_graduation": vc.year_of_graduation + "-01-01T00:00:00Z",
                }
            }

            data = {
                "data_to_sign": dataToSign,
                "private_key": private_key_str,
                "public_key": public_key_str,
            }

            # Si la signature est réussie, on enregistre le numéro de session utilisé au moment de la signature
            if not SessionNumber.objects.filter(session_number=request.session.get('session_number')).exists():
                new_session = SessionNumber(user=issuer, session_number=request.session.get('session_number'))
                new_session.save()
            else:
                new_session = SessionNumber.objects.get(session_number=request.session.get('session_number'))

            api_url = 'http://localhost:3000/ld/sign-vc/'
            response = requests.post(api_url, json=data)
            if response.status_code == 200:

                # On spécifie que la session a été utilisée pour signature
                new_session.used_for_signing = True
                new_session.save()
                signed_vc = response.json()
                vc.status = "signed"
                vc.key_uuid = pairkey.uuid

                vc.signedvc = json.dumps(signed_vc.get('signed_vc'))
                vc.ld = True
                vc.save()
                return redirect('/dashboard-signing')
            else:
                # Si la signature est réussie, on garde l'enregistrement de la session, sinon on le supprime
                a_supprimer = SessionNumber.objects.get(session_number=request.session.get('session_number'))
                if not a_supprimer.used_for_signing:
                    a_supprimer.delete()
                return JsonResponse({'error': 'Failed to sign VC'}, status=500)


        elif method=="zkp-cl":


            dataToSign = {
                "@context": ["http://127.0.0.1:8000/universitydegree/example"],
                "id": int(vc.id),
                "type":
                    ["VerifiableCredential", "UniversityDegreeCredential"],
                "issuer": public_key_str,
                "issuanceDate": formatted_date_time,
                "session_number": request.session.get('session_number'),
                "subject": vc.first_name + " " + vc.name,
                "credentialSubject": {
                    "id": int(vc.id),
                    "degree": vc.degree,
                    "university": {
                        "id": "https://www.telecom-sudparis.eu/",
                        "name": vc.institution,
                    },
                    "year_of_graduation": vc.year_of_graduation + "-01-01T00:00:00Z",
                }
            }

            data = {
                "data_to_sign": dataToSign,
                "private_key": private_key_str,
                "public_key": public_key_str,
            }

            # Si la signature est réussie, on enregistre le numéro de session utilisé au moment de la signature
            if not SessionNumber.objects.filter(session_number=request.session.get('session_number')).exists():
                new_session = SessionNumber(user=issuer, session_number=request.session.get('session_number'))
                new_session.save()
            else:
                new_session = SessionNumber.objects.get(session_number=request.session.get('session_number'))

            api_url = 'http://localhost:3000/zkp-cl/sign-vc/'
            response = requests.post(api_url, json=data)
            if response.status_code == 200:

                # On spécifie que la session a été utilisée pour signature
                new_session.used_for_signing = True
                new_session.save()
                signed_vc = response.json()
                vc.status = "signed"
                vc.signedvc = json.dumps(signed_vc.get('signed_vc'))
                vc.zkp_cl = True
                vc.save()
                return redirect('/dashboard-signing')
            else:
                # Si la signature est réussie, on garde l'enregistrement de la session, sinon on le supprime
                a_supprimer = SessionNumber.objects.get(session_number=request.session.get('session_number'))
                if not a_supprimer.used_for_signing:
                    a_supprimer.delete()
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
    """
    Affiche le tableau de bord de l'interface de signature de l'Issuing Authority.
    Affiche les diplômes à signer et les diplômes déjà signés.
    Rendu de la page VC_interface/dashboard_signing.html.
    """
    issuer = Issuer.objects.get(username=request.user.username)
    notsigning = UniversityDegree.objects.filter(status="unsigned", institution=issuer.institution)
    signing = UniversityDegree.objects.filter(status="signed", institution=issuer.institution)
    private_keys = PairKeyStorage.objects.filter(issuer=issuer)

    context = {
        'notsigning': notsigning,
        'signing': signing,
        'private_keys': private_keys,
    }

    return render(request, "VC_interface/dashboard_signing.html", context)

def generate_qr_code(request, vc_id):
    """
    Génère un code QR contenant un lien de vérification du diplôme.
    Prend en charge la génération du QR code pour les diplômes signés via BBS+ ou JWT.
    """
    if request.method == "POST":
        title = request.POST.get('schema')
        print(title)
        vc = UniversityDegree.objects.get(uuid=vc_id)
        if vc.bbs:
            # Générez le lien de vérification du VC
            verification_link = "127.0.0.1:8000/verify-vc-bbs/" + vc_id + "=" + title
        else:
            verification_link = "127.0.0.1:8000/verify-vc-jwt/" + vc_id + "=" + title
        print(verification_link)
        # Créez le QR code contenant le lien de vérification
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(verification_link)
        qr.make(fit=True)

        # Générez l'image du QR code
        img = qr.make_image(fill_color="black", back_color="white")

        # Créez une réponse HTTP contenant l'image du QR code
        response = HttpResponse(content_type="image/png")
        img.save(response, "PNG")
        return response
    else:
        return render(request, 'VC_interface/dashboard.html')

def verify_vc_jwt(request, id, title):
    """
    Vérifie un diplôme signé avec JWT.
    """
    university_degree = UniversityDegree.objects.get(uuid=id)
    vc_jwt = university_degree.signedvc.replace('"', "")
    issuer = Issuer.objects.get(institution=university_degree.institution)
    secret_key = PairKeyStorage.objects.get(uuid=university_degree.key_uuid).private_key
    url = "http://localhost:3000/jwt_verify/verify-vc"
    payload = {"vc": vc_jwt}
    try:
        response = requests.post(url, json=payload)

        if response.status_code == 200:
            data = response.json()
            verified = data.get("verified", False)
            if verified:
                decoded_token = jwt.decode(vc_jwt, secret_key, algorithms=['HS256'])
                iat_datetime = datetime.datetime.utcfromtimestamp(decoded_token.get("iat"))
                vc = {
                    "subject": decoded_token.get("sub"),
                    "issuer": decoded_token.get("iss"),
                    "institution": decoded_token.get("credentialSubject").get('university'),
                    "degree": decoded_token.get("credentialSubject").get('degree'),
                    "year_of_graduation": decoded_token.get("credentialSubject").get('year_of_graduation'),
                    "created_at" : iat_datetime,
                    "signature" : "JWT",
                    "id" : decoded_token.get('id'),
                }
                context = {
                    'vc': vc,
                }
                return render(request, 'VC_interface/VC_verify.html', context)
            else:
                error = data.get("error", "Unknown error")
                print(f"Failed to verify VC: {error}")
                return render(request, 'VC_interface/VC_notverify.html')
        else:
            print(f"Failed to verify VC: {response.status_code}")
            return render(request, 'VC_interface/VC_notverify.html')
    except Exception as e:
        print(f"Failed to verify VC: {e}")
        return render(request, 'VC_interface/VC_notverify.html')

def verify_vc_bbs(request, id, title):
    """
    Vérifie un diplôme signé avec BBS.
    """
    vc = UniversityDegree.objects.get(uuid=id)
    signed_vc = vc.signedvc.replace("'", "\"")

    if title== "institution":
        print(json.loads(signed_vc))
        payload = {"vc": signed_vc,
                   "revealedAttributes" : ["institution"]
                   }
        case = 0

    elif title == "title":
        payload = {"vc": signed_vc,
                   "revealedAttributes": ["title"]
                   }
        case = 1

    elif title == "year":
        payload = {"vc": signed_vc,
                   "revealedAttributes": ["year"]
                   }
        case = 2
    elif title == "student":
        payload = {"vc": signed_vc,
                      "revealedAttributes": ["student"]
                     }
        case = 3
    else:
        payload = {"vc": signed_vc,
                   "revealedAttributes": []
                   }
        case = 4


    print(payload)
    url = "http://localhost:3000/bbs_verify/verify-vc"
    response = requests.post(url, json=payload)
    if response.status_code == 200:
        data = response.json()
        verified = data.get("message")
        if verified == "VC signature verified successfully.":
            if case == 0:
                context = {
                    "institution" : vc.institution,
                    "created_at": vc.created_at,
                }
                return render(request, 'VC_interface/VC_verify_institution.html', context)
            elif case == 1:
                context = {
                    "degree": vc.degree,
                    "created_at": vc.created_at,
                }
                return render(request, 'VC_interface/VC_verify_degree.html', context)
            elif case == 2:
                context = {
                    "year_of_graduation": vc.year_of_graduation,
                    "created_at": vc.created_at,
                }
                return render(request, 'VC_interface/VC_verify_year.html', context)
            elif case == 3:
                context = {
                    "name": vc.first_name + " " + vc.name,
                    "created_at": vc.created_at,
                }
                return render(request, 'VC_interface/VC_verify_student.html', context)
            else:
                context = {
                    "vc": vc,
                }
                return render(request, 'VC_interface/VC_verify.html', context)

        else:
            print("Failed to verify VC: ", data.get("message"))
            return render(request, 'VC_interface/VC_notverify.html')
    else:
        print("Failed to verify VC: ", response.status_code)
        return render(request, 'VC_interface/VC_notverify.html')


def check_session_number_for_verification(request, session_number):
    # Vérifier si le numéro de session existe dans la base de données
    session_exists = SessionNumber.objects.filter(session_number=session_number).exists()

    # Retourner une réponse JSON avec True si le numéro de session existe, sinon False
    return JsonResponse({'session_exists': session_exists})


def check_session_number_for_signature(request, session_number):
    # Vérifier si le numéro de session existe dans la base de données
    session = SessionNumber.objects.get(session_number=session_number)
    print(SessionNumber.objects.filter(session_number=session_number).exists())
    print(session.is_valid())
    if SessionNumber.objects.filter(session_number=session_number).exists() and session.is_valid():
        # Retourner une réponse JSON avec True si le numéro de session existe, sinon False
        return JsonResponse({'session_exists': True})
    else:
        return JsonResponse({'session_exists': False})