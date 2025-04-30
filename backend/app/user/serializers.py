from django.contrib.auth import get_user_model
from rest_framework import serializers

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from django.contrib.auth.forms import PasswordResetForm, SetPasswordForm
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.conf import settings

class UserSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = get_user_model()
        fields = ['name', 'email', 'password', 'confirm_password']
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, attrs):
        request_data = self.context['request'].data
        if request_data.get('password') != request_data.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Passwords must match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        user = get_user_model().objects.create_user(**validated_data)
        try:
            validate_password(password=validated_data['password'], user=user)
        except ValidationError as err:
            user.delete()
            raise serializers.ValidationError({'password': err.messages})
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        user = authenticate(
            request=self.context.get('request'),
            username=email,
            password=password
        )

        if not user:
            raise serializers.ValidationError(
                _('Unable to authenticate with provided credentials.'),
                code='authorization'
            )

        data = super().validate(attrs)
        data['user_id'] = user.id
        data['email'] = user.email

        return data

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, email):
        form = PasswordResetForm(data={'email': email})
        if not form.is_valid():
            raise serializers.ValidationError('Invalid email address')
        # build the full URL using the current request
        opts = {
            'request': self.context['request'],
            'use_https': self.context['request'].is_secure(),
            'from_email': settings.DEFAULT_FROM_EMAIL,
        }
        form.save(**opts)
        return email


class ResetPasswordSerializer(serializers.Serializer):
    uidb64       = serializers.CharField(write_only=True)
    token        = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password2= serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['new_password2']:
            raise serializers.ValidationError('Passwords do not match.')

        try:
            uid  = force_str(urlsafe_base64_decode(data['uidb64']))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError('Invalid UID.')

        if not default_token_generator.check_token(user, data['token']):
            raise serializers.ValidationError('Invalid or expired token.')

        data['user'] = user
        return data

    def save(self):
        user     = self.validated_data['user']
        password = self.validated_data['new_password']
        form = SetPasswordForm(user, {
            'new_password1': password,
            'new_password2': password,
        })
        if not form.is_valid():
            raise serializers.ValidationError(form.errors)
        form.save()
        return user