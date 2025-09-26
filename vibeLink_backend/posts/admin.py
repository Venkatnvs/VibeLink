from django.contrib import admin
from .models import Post, PostLike, PostShare

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'content_preview', 'likes_count', 'shares_count', 'created_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['user__username', 'content']
    readonly_fields = ['likes_count', 'shares_count', 'created_at', 'updated_at']
    
    def content_preview(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content
    content_preview.short_description = "Content Preview"

@admin.register(PostLike)
class PostLikeAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'post', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'post__content']

@admin.register(PostShare)
class PostShareAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'post', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'post__content']
