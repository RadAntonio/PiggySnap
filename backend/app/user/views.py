from rest_framework import generics, authentication, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from user.serializers import UserSerializer, CustomTokenObtainPairSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication

from rest_framework import generics, status
from rest_framework.response import Response
from .serializers import ForgotPasswordSerializer, ResetPasswordSerializer

from drf_spectacular.utils import extend_schema

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