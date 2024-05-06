from django.contrib import admin
from .models import Issuer, Holder, SessionNumber
# Register your models here.
class IssuerAdmin(admin.ModelAdmin):
    list_display = ['username', 'institution', 'uuid', 'did']

admin.site.register(Issuer, IssuerAdmin)

class HolderAdmin(admin.ModelAdmin):
    list_display = ['username', 'uuid', 'did']


admin.site.register(Holder, HolderAdmin)

class SessionNumberAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at', 'expired_at', 'session_number']


admin.site.register(SessionNumber, SessionNumberAdmin)