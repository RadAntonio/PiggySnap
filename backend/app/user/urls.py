from django.urls import path

from rest_framework_simplejwt.views import TokenRefreshView
from user.views import (
    CreateUserView, ManageUserView,
    ForgotPasswordAPIView, ResetPasswordAPIView,
    Enable2FAView, Verify2FASetupView,
    TokenObtainPair2FA, TokenVerify2FA,
    Disable2FAView,
)


app_name = 'user'

urlpatterns = [
    path('create',    CreateUserView.as_view(),      name='create'),
    path('me',        ManageUserView.as_view(),      name='me'),
    path('forgot-password/', ForgotPasswordAPIView.as_view(), name='forgot-password'),
    path('reset-password/<uidb64>/<token>/', ResetPasswordAPIView.as_view(), name='reset-password'),

    # NEW 2FA-PROVISIONING
    path('2fa/enable/', Enable2FAView.as_view(),        name='enable-2fa'),
    path('2fa/disable/',  Disable2FAView.as_view(),     name='disable-2fa'),
    path('2fa/verify/', Verify2FASetupView.as_view(),   name='verify-2fa-setup'),

    # REPLACED TOKEN ENDPOINTS
    path('token',           TokenObtainPair2FA.as_view(), name='token_obtain_pair'),
    path('token/refresh',   TokenRefreshView.as_view(),   name='token_refresh'),
    path('token/verify-2fa', TokenVerify2FA.as_view(),    name='token_verify_2fa'),
]