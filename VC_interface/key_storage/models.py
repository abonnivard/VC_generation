from django.db import models
from accounts.models import Issuer
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
import uuid

class PrivateKey(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    name = models.CharField(max_length=100)
    issuer = models.ForeignKey(Issuer, on_delete=models.CASCADE)
    #TODO cette manière de stocker ne va pâs, il faut stocker les clés de manière différente
    private_key = models.TextField()
    public_key = models.TextField()
    def __str__(self):
        return f"PrivateKey for {self.issuer.username}"

    @classmethod
    def generate_rsa_keys(cls):
        # Générer une paire de clés RSA
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048
        )
        # Sérialiser la clé privée
        private_key_bytes = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        # Sérialiser la clé publique
        public_key_bytes = private_key.public_key().public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        return private_key_bytes, public_key_bytes


class JWTsignature(models.Model):
    jwt = models.TextField()
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user_uuid = models.TextField(default="")