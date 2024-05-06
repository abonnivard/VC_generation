from django.db import models
import uuid
# Create your models here.
class UniversityDegree(models.Model):
    user_uuid = models.TextField(default="")
    institution = models.CharField(max_length=100)
    year_of_graduation = models.CharField(max_length=15)
    first_name = models.CharField(max_length=100)
    degree = models.CharField(max_length=300)
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    status = models.CharField(max_length=100, default="unsigned")
    jwt = models.BooleanField(default=False)
    bss = models.BooleanField(default=False)
    ld = models.BooleanField(default=False)
    signedvc = models.TextField(default="")

    def __str__(self):
        return f"{self.first_name} {self.name}'s University Degree"
