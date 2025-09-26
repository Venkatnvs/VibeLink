from django.contrib import admin
from .models import UserSettings

@admin.register(UserSettings)
class UserSettingsAdmin(admin.ModelAdmin):
    list_display = ['user', 'profile_visibility', 'location_radius', 'theme', 'created_at']
    list_filter = ['profile_visibility', 'theme', 'show_location', 'allow_messages']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['created_at', 'updated_at']
