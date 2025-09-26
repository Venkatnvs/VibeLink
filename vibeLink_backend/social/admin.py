from django.contrib import admin
from .models import Follow, Notification, AIRecommendationCache

@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    list_display = ['id', 'follower', 'following', 'created_at']
    list_filter = ['created_at']
    search_fields = ['follower__username', 'following__username']

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'from_user', 'notification_type', 'content_preview', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['user__username', 'from_user__username', 'content']
    
    def content_preview(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content
    content_preview.short_description = "Content Preview"

@admin.register(AIRecommendationCache)
class AIRecommendationCacheAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'cache_key', 'created_at', 'expires_at', 'is_valid']
    list_filter = ['is_valid', 'created_at', 'expires_at']
    search_fields = ['user__username', 'cache_key']