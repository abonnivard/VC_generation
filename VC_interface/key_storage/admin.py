from django.contrib import admin
from .models import PairKeyStorage

class PrivateKeyAdmin(admin.ModelAdmin):
    list_display = ['uuid', 'issuer','name', 'private_key', 'public_key']


admin.site.register(PairKeyStorage, PrivateKeyAdmin)

