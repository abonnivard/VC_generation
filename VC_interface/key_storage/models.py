from django.db import models
from accounts.models import Issuer
import uuid
import requests

class PairKeyStorage(models.Model):
    """
    Modèle pour stocker les paires de clés privées et publiques pour les Issuing Authorities.
    """

    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    name = models.CharField(max_length=100)
    issuer = models.ForeignKey(Issuer, on_delete=models.CASCADE)
    private_key = models.TextField()
    public_key = models.TextField()
    key_type = models.CharField(default="bls", max_length=10)

    def __str__(self):
        return f"PrivateKey for {self.issuer.username}"

    @classmethod
    def generate_keys(cls, key_type):
        """
        Génère une paire de clés privée et publique.
        Prend en charge la génération de clés BLS et Ed25519.
        Retourne la clé privée et publique ou None si la génération échoue.
        """
        try:
            if key_type == 'bls':
                # Effectuer une requête HTTP POST vers l'URL pour générer une paire de clés BLS
                response = requests.post('http://localhost:3000/generate_keypair/generate_bls_keypair/')
            elif key_type == 'ed25519':
                # Effectuer une requête HTTP POST vers l'URL pour générer une paire de clés Ed25519
                response = requests.post('http://localhost:3000/generate_keypair/generate_ed25519_keypair/')
            else:
                raise ValueError("Invalid key type specified")


            # Vérifier si la requête a réussi (statut 200)
            if response.status_code == 200:
                # Extraire les données JSON de la réponse
                data = response.json()
                # Extraire la clé privée et publique à partir des données JSON
                private_key_base64 = data['privateKey']
                public_key_base64 = data['publicKey']

                # Retourner la clé privée et publique ainsi que le type de clé
                return private_key_base64, public_key_base64
            else:
                print(f"Erreur lors de la récupération de la paire de clés: {response.status_code}")
                return None, None
        except Exception as e:
            print(f"Erreur lors de la récupération de la paire de clés: {str(e)}")
            return None, None
