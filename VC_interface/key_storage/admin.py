from django.contrib import admin
from .models import PrivateKey, JWTsignature

class PrivateKeyAdmin(admin.ModelAdmin):
    list_display = ['uuid', 'issuer','name', 'private_key', 'public_key']


admin.site.register(PrivateKey, PrivateKeyAdmin)

class JWTsignatureAdmin(admin.ModelAdmin):
    list_display = ["jwt", "user_uuid", "uuid"]

admin.site.register(JWTsignature,JWTsignatureAdmin)

