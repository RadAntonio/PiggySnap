from django.conf import settings
from django.contrib.auth import get_user_model

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication

from user.serializers import UserSerializer, CustomTokenObtainPairSerializer
from .serializers import ForgotPasswordSerializer, ResetPasswordSerializer, GoogleAuthSerializer

@extend_schema(
    request=UserSerializer,
    responses=UserSerializer
)
class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class ManageUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class ForgotPasswordAPIView(generics.GenericAPIView):
    serializer_class = ForgotPasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        return Response(
            {"detail": "If that email is registered, you’ll receive a reset link."},
            status=status.HTTP_200_OK,
        )


class ResetPasswordAPIView(generics.GenericAPIView):
    serializer_class = ResetPasswordSerializer

    def post(self, request, uidb64, token, *args, **kwargs):
        data = {**request.data, "uidb64": uidb64, "token": token}
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Password has been reset successfully."},
            status=status.HTTP_200_OK,
        )

@extend_schema(
    request=GoogleAuthSerializer,
    responses={200: OpenApiResponse(
        response=CustomTokenObtainPairSerializer  # or just list the fields
    )}
)
class GoogleLoginAPIView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = GoogleAuthSerializer

    def post(self, request, *args, **kwargs):
        # this will force swagger to emit a JSON body editor
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data["id_token"]
        try:
            idinfo = id_token.verify_oauth2_token(
                token, google_requests.Request(), settings.GOOGLE_CLIENT_ID
            )
        except ValueError:
            return Response(
                {"detail": "Invalid ID token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = idinfo["email"]
        name  = idinfo.get("name", "")
        user, _ = User.objects.get_or_create(
            email=email,
            defaults={"name": name, "password": User.objects.make_random_password()},
        )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "refresh": str(refresh),
                "access" : str(refresh.access_token),
                "user": {
                  "id":    user.id,
                  "email": user.email,
                  "name":  user.name,
                }
            },
            status=status.HTTP_200_OK,
        )