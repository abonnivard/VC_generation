from django.db import models
import uuid


class Issuer(models.Model):
    is_issuer = models.BooleanField(default=True)
    is_holder = models.BooleanField(default=False)
    username = models.CharField(max_length=100)
    institution = models.CharField(max_length=100, default="Unknown")
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    did = models.CharField(max_length=100, default="did:ethr:example")
    def __str__(self):
        return self.username


class Holder(models.Model):
    is_issuer = models.BooleanField(default=False)
    is_holder = models.BooleanField(default=True)
    username = models.CharField(max_length=100)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    did = models.CharField(max_length=100, default="did:ethr:example")
    def __str__(self):
        return self.username