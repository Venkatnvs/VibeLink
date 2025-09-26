from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import hashlib
import json

User = get_user_model()

class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['follower', 'following']

    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('like', 'Like'),
        ('share', 'Share'),
        ('follow', 'Follow'),
        ('message', 'Message'),
        ('match', 'Match'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    from_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='social_notifications_sent', null=True, blank=True)
    notification_type = models.CharField(max_length=10, choices=NOTIFICATION_TYPES)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username}: {self.content[:50]}..."

class AIRecommendationCache(models.Model):
    """
    Cache for AI-generated user recommendations to avoid repeated Gemini API calls
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_recommendation_caches')
    cache_key = models.CharField(max_length=64, unique=True, help_text='Hash of user settings and preferences')
    recommendations_data = models.JSONField(help_text='Cached AI recommendations data')
    page = models.PositiveIntegerField(help_text='Page number for pagination')
    per_page = models.PositiveIntegerField(help_text='Items per page')
    total_matches = models.PositiveIntegerField(help_text='Total number of matches found')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(help_text='When this cache entry expires')
    is_valid = models.BooleanField(default=True, help_text='Whether this cache entry is still valid')
    
    # Settings hash to detect changes
    settings_hash = models.CharField(max_length=64, help_text='Hash of user settings when cache was created')
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'cache_key']),
            models.Index(fields=['expires_at']),
            models.Index(fields=['is_valid']),
        ]
    
    def __str__(self):
        return f"AI Cache for {self.user.username} - Page {self.page} (Expires: {self.expires_at})"
    
    @classmethod
    def generate_cache_key(cls, user, page, per_page, settings_hash):
        """Generate a unique cache key based on user, pagination, and settings"""
        key_data = f"{user.id}_{page}_{per_page}_{settings_hash}"
        return hashlib.md5(key_data.encode()).hexdigest()
    
    @classmethod
    def generate_settings_hash(cls, user):
        """Generate a hash of user's matchmaking settings"""
        try:
            # Get user settings if they exist
            settings = user.settings
            settings_data = {
                'location_radius': settings.location_radius,
                'min_age': settings.min_age,
                'max_age': settings.max_age,
                'show_distance': settings.show_distance,
            }
        except:
            # Default settings if user doesn't have settings
            settings_data = {
                'location_radius': 50,
                'min_age': 18,
                'max_age': 65,
                'show_distance': True,
            }
        
        # Include user's hashtags and location in the hash
        user_data = {
            'hashtags': sorted(user.hashtags) if user.hashtags else [],
            'city': user.city,
            'state': user.state,
            'latitude': str(user.latitude) if user.latitude else None,
            'longitude': str(user.longitude) if user.longitude else None,
        }
        
        combined_data = {**settings_data, **user_data}
        data_string = json.dumps(combined_data, sort_keys=True)
        return hashlib.md5(data_string.encode()).hexdigest()
    
    @classmethod
    def get_valid_cache(cls, user, page, per_page):
        """Get valid cached recommendations for a user"""
        current_settings_hash = cls.generate_settings_hash(user)
        cache_key = cls.generate_cache_key(user, page, per_page, current_settings_hash)
        
        try:
            cache_entry = cls.objects.get(
                user=user,
                cache_key=cache_key,
                is_valid=True,
                expires_at__gt=timezone.now()
            )
            return cache_entry
        except cls.DoesNotExist:
            return None
    
    @classmethod
    def create_cache_entry(cls, user, page, per_page, recommendations_data, total_matches):
        """Create or update a cache entry"""
        settings_hash = cls.generate_settings_hash(user)
        cache_key = cls.generate_cache_key(user, page, per_page, settings_hash)
        
        # Set expiration time (24 hours from now)
        expires_at = timezone.now() + timezone.timedelta(hours=24)
        
        # Invalidate old cache entries for this user
        cls.objects.filter(user=user, is_valid=True).update(is_valid=False)
        
        # Create or update cache entry
        cache_entry, created = cls.objects.update_or_create(
            cache_key=cache_key,
            defaults={
                'user': user,
                'recommendations_data': recommendations_data,
                'page': page,
                'per_page': per_page,
                'total_matches': total_matches,
                'expires_at': expires_at,
                'settings_hash': settings_hash,
                'is_valid': True
            }
        )
        
        return cache_entry
    
    @classmethod
    def invalidate_user_cache(cls, user):
        """Invalidate all cache entries for a user (when settings change)"""
        cls.objects.filter(user=user, is_valid=True).update(is_valid=False)
    
    @classmethod
    def cleanup_expired_cache(cls):
        """Clean up expired cache entries"""
        cls.objects.filter(
            expires_at__lt=timezone.now()
        ).update(is_valid=False)