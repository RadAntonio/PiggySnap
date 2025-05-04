from django.urls import path

from user import views

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


app_name = 'user'

urlpatterns = [
    path('create', views.CreateUserView.as_view(), name='create'),
    path('token', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    path('me', views.ManageUserView.as_view(), name='me'),
    path(
        "forgot-password",
        views.ForgotPasswordAPIView.as_view(),
        name="forgot-password",
    ),
    path(
        "reset-password/<uidb64>/<token>",
        views.ResetPasswordAPIView.as_view(),
        name="reset-password",
    ),
     path('google-login', views.GoogleLoginAPIView.as_view(), name='google-login'),
]