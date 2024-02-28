from django.contrib import admin
from .models import Issuer, Holder
# Register your models here.
class IssuerAdmin(admin.ModelAdmin):
    list_display = ['username', 'institution', 'uuid']


admin.site.register(Issuer, IssuerAdmin)

class HolderAdmin(admin.ModelAdmin):
    list_display = ['username', 'uuid']


admin.site.register(Holder, HolderAdmin)