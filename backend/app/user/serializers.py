from django.contrib.auth import get_user_model
from rest_framework import serializers

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError


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