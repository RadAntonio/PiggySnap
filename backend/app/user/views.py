# app/user/views.py

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
import io, base64, pyotp, qrcode
from datetime import timedelta

from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.authentication import JWTAuthentication

from user.serializers import UserSerializer
from .serializers import (
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    TokenObtainPair2FASerializer,
    TokenVerify2FASerializer,
    TokenVerify2FASerializer1,
)

User = get_user_model()


@extend_schema(
    request=UserSerializer,
    responses=UserSerializer
)
class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer


class ManageUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ForgotPasswordAPIView(generics.GenericAPIView):
    serializer_class = ForgotPasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data, context={"request": request}
        )
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


class Enable2FAView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # 1) Generate (or reuse) a Base32 secret stored on the user
        if not getattr(user, "totp_secret", None):
            secret = pyotp.random_base32()
            user.totp_secret = secret
            user.save(update_fields=["totp_secret"])
        else:
            secret = user.totp_secret

        # 2) Build the provisioning URI for any TOTP app
        uri = pyotp.TOTP(secret).provisioning_uri(
            name=user.email,
            issuer_name="YourAppName"
        )

        # 3) Render a PNG QR code → Base64
        img = qrcode.make(uri)
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        qr_b64 = base64.b64encode(buf.getvalue()).decode()

        # 4) Build a Duo-style activation code: groups of 4 chars
        activation_code = "-".join(secret[i:i+4] for i in range(0, len(secret), 4))

        return Response({
            "qr_code_b64": qr_b64,
            "secret": secret,
            "activation_code": activation_code
        })


@extend_schema(request=TokenVerify2FASerializer1)
class Verify2FASetupView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        token = request.data.get("token")
        if request.user.totp.verify(token, valid_window=1):
            request.user.two_factor_enabled = True
            request.user.save(update_fields=["two_factor_enabled"])
            return Response({"detail": "2FA enabled"})
        return Response(
            {"detail": "Invalid code"},
            status=status.HTTP_400_BAD_REQUEST
        )


@extend_schema(
    request=TokenObtainPair2FASerializer,
    responses={200: OpenApiResponse(description="…")}
)
class TokenObtainPair2FA(APIView):
    """
    POST /api/user/token/ → { access, refresh } OR { require2fa, pre_token }
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        user = authenticate(request, username=email, password=password)
        if not user:
            return Response(
                {"detail": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        if user.two_factor_enabled:
            pre = AccessToken()
            pre["user_id"] = user.id
            pre["2fa_step"] = True
            pre.set_exp(lifetime=timedelta(minutes=5))
            return Response({
                "require2fa": True,
                "pre_token": str(pre)
            })
        r = RefreshToken.for_user(user)
        return Response({
            "access": str(r.access_token),
            "refresh": str(r)
        })


@extend_schema(request=TokenVerify2FASerializer)
class TokenVerify2FA(APIView):
    """
    POST /api/user/token/verify-2fa/ → { access, refresh }
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        pre_token = request.data.get("pre_token")
        code = request.data.get("token")
        try:
            tok = AccessToken(pre_token)
        except:
            return Response(
                {"detail": "Invalid or expired token"},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not tok.get("2fa_step"):
            return Response(
                {"detail": "Bad token"},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            user = User.objects.get(id=tok["user_id"])
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not user.totp.verify(code, valid_window=1):
            return Response(
                {"detail": "Invalid 2FA code"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        r = RefreshToken.for_user(user)
        return Response({
            "access": str(r.access_token),
            "refresh": str(r)
        })

class Disable2FAView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        user = request.user
        user.two_factor_enabled = False
        user.totp_secret = ""  # optional: clear secret
        user.save(update_fields=["two_factor_enabled","totp_secret"])
        return Response({"detail":"2FA disabled"})

