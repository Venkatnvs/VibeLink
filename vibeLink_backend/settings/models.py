from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='settings')
    
    # Notification settings
    likes_notifications = models.BooleanField(default=True)
    shares_notifications = models.BooleanField(default=True)
    matches_notifications = models.BooleanField(default=True)
    messages_notifications = models.BooleanField(default=True)
    
    # Privacy settings
    profile_visibility = models.CharField(
        max_length=10,
        choices=[('public', 'Public'), ('friends', 'Friends Only'), ('private', 'Private')],
        default='public'
    )
    show_location = models.BooleanField(default=True)
    allow_messages = models.CharField(
        max_length=10,
        choices=[('everyone', 'Everyone'), ('friends', 'Friends Only'), ('none', 'None')],
        default='friends'
    )
    show_online_status = models.BooleanField(default=False)
    
    # Matchmaking settings
    location_radius = models.PositiveIntegerField(default=50)  # in kilometers
    min_age = models.PositiveIntegerField(default=18)
    max_age = models.PositiveIntegerField(default=65)
    show_distance = models.BooleanField(default=True)
    
    # Appearance settings
    theme = models.CharField(
        max_length=10,
        choices=[('light', 'Light'), ('dark', 'Dark'), ('system', 'System')],
        default='system'
    )
    font_size = models.CharField(
        max_length=10,
        choices=[('small', 'Small'), ('medium', 'Medium'), ('large', 'Large')],
        default='medium'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "User Settings"
        verbose_name_plural = "User Settings"
    
    def __str__(self):
        return f"Settings for {self.user.username}"
