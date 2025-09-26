from rest_framework import serializers
from .models import UserSettings

class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = [
            'likes_notifications', 'shares_notifications', 'matches_notifications', 'messages_notifications',
            'profile_visibility', 'show_location', 'allow_messages', 'show_online_status',
            'location_radius', 'min_age', 'max_age', 'show_distance',
            'theme', 'font_size'
        ]
        read_only_fields = ['created_at', 'updated_at']

class UserSettingsUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = [
            'likes_notifications', 'shares_notifications', 'matches_notifications', 'messages_notifications',
            'profile_visibility', 'show_location', 'allow_messages', 'show_online_status',
            'location_radius', 'min_age', 'max_age', 'show_distance',
            'theme', 'font_size'
        ]
