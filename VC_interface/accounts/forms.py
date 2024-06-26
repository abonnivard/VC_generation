from django import forms
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib.auth.models import User



class UserLoginForm(AuthenticationForm):
    def __init__(self, *args, **kwargs):
        super(UserLoginForm, self).__init__(*args, **kwargs)

    username = forms.CharField(widget=forms.TextInput(
        attrs={'class': 'form-control',
               'placeholder': 'Username',
               'id': 'username',
               }))
    password = forms.CharField(widget=forms.PasswordInput(
        attrs={
            'class': 'form-control',
            'placeholder': 'Password',
            'id': 'username',
        }
))

class UserForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('username', 'password1', 'password2')
