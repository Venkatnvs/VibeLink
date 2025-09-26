from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Post, PostLike, PostShare

User = get_user_model()

class PostUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    profile_photo = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'profile_photo', 'is_following']

    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_profile_photo(self, obj):
        if obj.profile_photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_photo.url)
            return obj.profile_photo.url
        return None
    
    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from social.models import Follow
            return Follow.objects.filter(follower=request.user, following=obj).exists()
        return False

class PostSerializer(serializers.ModelSerializer):
    user = PostUserSerializer(read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_shared = serializers.SerializerMethodField()
    timestamp = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'user', 'content', 'image', 'hashtags', 
            'likes_count', 'shares_count', 'created_at', 'updated_at',
            'is_liked', 'is_shared', 'timestamp'
        ]

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return PostLike.objects.filter(user=request.user, post=obj).exists()
        return False

    def get_is_shared(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return PostShare.objects.filter(user=request.user, post=obj).exists()
        return False

    def get_timestamp(self, obj):
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff.days > 0:
            return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        else:
            return "Just now"

class CreatePostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['content', 'image', 'hashtags']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
