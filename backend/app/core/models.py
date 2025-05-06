"""
DataBase models
"""
import pyotp
from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.utils.timezone import now
from datetime import datetime, date



class UserManager(BaseUserManager):
    """Manager for Users"""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('User must have an email address')
        user = self.model(email=self.normalize_email(email), **extra_fields)
        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, email, password):
        user = self.create_user(email, password)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)

        return user


class User(AbstractBaseUser, PermissionsMixin):
    """User in the system"""
    email = models.EmailField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    totp_secret        = models.CharField(
        max_length=32,
        blank=True,
        help_text="Base32 secret key for TOTP-2FA"
    )
    two_factor_enabled = models.BooleanField(
        default=False,
        help_text="Whether the user has completed TOTP setup"
    )

    @property
    def totp(self):
        # lazy-provision a secret on first use
        if not self.totp_secret:
            self.totp_secret = pyotp.random_base32()
            self.save(update_fields=['totp_secret'])
        return pyotp.TOTP(self.totp_secret)

def today_as_datetime():
    today = now().date()
    return datetime.combine(today, datetime.min.time())

class Receipt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='receipts')
    shop_name = models.CharField(max_length=255)
    items = models.JSONField()
    total = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(default=today_as_datetime)
    tags = models.ManyToManyField('Tag', blank=True, related_name='receipts')
    # def __str__(self):
        # return f"{self.shop_name} - {self.total} RON - {self.date.strftime('%Y-%m-%d %H:%M:%S')}"

class Tag(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tags')
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name

    class Meta:
        unique_together = ('user', 'name')