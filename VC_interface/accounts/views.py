from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import UserForm
from .models import Issuer, Holder
import uuid

def generate_session_number():
    return str(uuid.uuid4())


def register_holder(request):
    if request.method == 'POST':
        form = UserForm(request.POST)
        if form.is_valid():
            form.save()
            password = request.POST['password1']
            username = request.POST['username']
            user = authenticate(request, password=password, username=username)
            if user is not None:
                login(request, user)
                new = Holder(username=request.user.username)
                new.save()
                # Générer et stocker le numéro de session
                request.session['session_number'] = generate_session_number()
            if request.user.is_authenticated:
                return redirect('../dashboard/')
    else:
        form = UserForm()
    context = {
        'form': form,
        'issuer': False
    }
    return render(request, 'accounts/register.html', context)


def register_issuer(request):
    if request.method == 'POST':
        form = UserForm(request.POST)
        if form.is_valid():
            form.save()
            password = request.POST['password1']
            username = request.POST['username']
            user = authenticate(request, password=password, username=username)

            if user is not None:
                login(request, user)
                new = Issuer(username=request.user.username, institution=request.POST['institution'])
                new.save()
                # Générer et stocker le numéro de session
                request.session['session_number'] = generate_session_number()
            if request.user.is_authenticated:
                return redirect("/dashboard-signing")
    else:
        form = UserForm()
    context = {
        'form': form,
        'issuer': True,
    }
    return render(request, 'accounts/register.html', context)
def login_function(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']

        # Authenticate the user
        user = authenticate(request, username=username, password=password)

        if user is not None:

            # Login the user

            login(request, user)
            # Générer et stocker le numéro de session
            request.session['session_number'] = generate_session_number()
            if Issuer.objects.filter(username=username).exists():
                return redirect('/dashboard-signing')
            else:
                return redirect('/dashboard')
        else:
            # Display an error message
            messages.error(request, 'Invalid email or password')
    return render(request, "accounts/login.html")


@login_required
def logout_view(request):
    # Logout the user
    logout(request)
    # Redirect to the login page
    return redirect('/')