from django.contrib import admin
from .models import UniversityDegree

class UniversityDegreeAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'name', 'year_of_graduation', 'institution', 'created_at']


admin.site.register(UniversityDegree)


