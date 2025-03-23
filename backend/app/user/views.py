from rest_framework import generics, authentication, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from user.serializers import UserSerializer, CustomTokenObtainPairSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication

from drf_spectacular.utils import extend_schema

@extend_schema(
    request=UserSerializer,
    responses=UserSerializer
)
class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class ManageUserView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user