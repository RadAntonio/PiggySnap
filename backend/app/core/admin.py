from django.contrib import admin
from django import forms
from core.models import Receipt, Tag
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from core import models

# admin@example.com
# 123456789admin

class UserAdmin(BaseUserAdmin):
    ordering = ['id']
    list_display = ['id', 'name', 'email']
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (
            _('Permissions'),
            {
                'fields': (
                    'is_active',
                    'is_staff',
                    'is_superuser',
                )
            }
        ),
        (_('Important dates'), {'fields': ('last_login',)})
    )
    readonly_fields = ['last_login']
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields' : (
                'email',
                'password1',
                'password2',
                'name',
                'is_active',
                'is_staff',
                'is_superuser',
            )
        }),
    )

class ReceiptAdminForm(forms.ModelForm):
    class Meta:
        model = Receipt
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if 'user' in self.fields:
            user = self.initial.get('user')
            if user:
                self.fields['tags'].queryset = Tag.objects.filter(user=user)
            else:
                self.fields['tags'].queryset = Tag.objects.none()

class ReceiptAdmin(admin.ModelAdmin):
    form = ReceiptAdminForm
    ordering = ['id']
    list_display = ['id', 'shop_name', 'total', 'formatted_date']

    def formatted_date(self, obj):
        return obj.date.strftime("%Y-%m-%d")
    formatted_date.short_description = 'Date'


admin.site.register(models.User, UserAdmin)
admin.site.register(models.Receipt, ReceiptAdmin)