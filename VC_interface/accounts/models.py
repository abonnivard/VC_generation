from django.db import models
import uuid
from django.utils import timezone



class Issuer(models.Model):
    is_issuer = models.BooleanField(default=True)
    is_holder = models.BooleanField(default=False)
    username = models.CharField(max_length=100)
    institution = models.CharField(max_length=100, default="Unknown")
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    did = models.CharField(max_length=255, default="")  # Champs DID

    def __str__(self):
        return self.username


class SessionNumber(models.Model):
    user = models.ForeignKey(Issuer, on_delete=models.CASCADE)
    session_number = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    expired_at = models.DateTimeField()
    used_for_signing = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        # Définir expired_at à la date et heure actuelles + 15 minutes
        self.expired_at = timezone.now() + timezone.timedelta(minutes=15)
        super().save(*args, **kwargs)

    def is_valid(self):
        return self.expired_at > timezone.now()
    def __str__(self):
            return f"Session Number: {self.session_number} - User: {self.user.username}"


class Holder(models.Model):
    is_issuer = models.BooleanField(default=False)
    is_holder = models.BooleanField(default=True)
    username = models.CharField(max_length=100)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    did = models.CharField(max_length=255, unique=True ,default="")  # Champ DID

    def __str__(self):
        return self.username