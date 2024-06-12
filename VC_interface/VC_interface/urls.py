from django.contrib import admin
from django.urls import path, include
from .views import dashboard, dashboard_signing, signing_page, generate_qr_code, verify_vc_bbs, verify_vc_jwt, check_session_number_for_verification, check_session_number_for_signature

app_name = 'VC_interface'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('accounts.urls')),
    path('', include('signing.urls')),
    path('', include('key_storage.urls')),
    path('dashboard/', dashboard, name='dashboard'),
    path('dashboard-signing/', dashboard_signing, name='dashboard_signing'),
    path('signing_page/id=<str:id>/', signing_page, name='signing_page'),
    path('generate-qr-code/<str:vc_id>', generate_qr_code, name='generate_qr_code'),
    path('verify-vc-jwt/<str:id>=<str:title>', verify_vc_jwt, name='verify_vc_jwt'),
    path('verify-vc-bbs/<str:id>=<str:title>', verify_vc_bbs, name='verify_vc_bss'),
    path('check-session-number-verification/<str:session_number>', check_session_number_for_verification, name='check_session_number'),
    path('check-session-number-signature/<str:session_number>', check_session_number_for_signature, name='check_session_number'),
]
