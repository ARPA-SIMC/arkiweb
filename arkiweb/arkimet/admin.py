from django.contrib import admin
from arkiweb.arkimet.models import User
from django.contrib.auth.admin import UserAdmin


# Register your models here.
class UserAdmin(UserAdmin):
    pass

admin.site.register(User, UserAdmin)
