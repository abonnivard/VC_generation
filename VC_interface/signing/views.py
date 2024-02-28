from django.shortcuts import render, redirect
from accounts.models import Issuer, Holder
from .models import UniversityDegree
def university_degree(request):
    if request.method == "POST":
        institution = request.POST.get('institution')
        year_of_graduation = request.POST.get('year')
        first_name = request.POST.get('firstname')
        name = request.POST.get('name')
        id_card_photo = "test"
        degree = request.POST.get('degree')
        user = Holder.objects.get(username=request.user.username)
        university_degree = UniversityDegree(
            user_uuid=user.uuid,
            institution=institution,
            year_of_graduation=year_of_graduation,
            first_name=first_name,
            name=name,
            id_card_photo=id_card_photo,
            degree=degree
        )
        university_degree.save()

        return redirect("/dashboard")

    #On cherche a avoir la liste des institutions
    issuers = Issuer.objects.all()
    list_institutions = []
    for issuer in issuers:
        if issuer.institution not in list_institutions:
            list_institutions.append(issuer.institution)
    context = {
        'institutions': list_institutions,

    }
    return render(request, "signing/university_degree.html", context)