from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Follow, Notification
import math

User = get_user_model()

class UserDiscoverySerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    profile_photo = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    follows_you = serializers.SerializerMethodField()
    is_mutual_follow = serializers.SerializerMethodField()
    match_percentage = serializers.SerializerMethodField()
    distance = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    posts_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'full_name', 'profile_photo', 'bio', 'age',
            'city', 'state', 'latitude', 'longitude', 'hashtags',
            'is_following', 'follows_you', 'is_mutual_follow', 'match_percentage', 'distance',
            'followers_count', 'following_count', 'posts_count',
            'date_joined'
        ]

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
            return Follow.objects.filter(follower=request.user, following=obj).exists()
        return False

    def get_follows_you(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Follow.objects.filter(follower=obj, following=request.user).exists()
        return False

    def get_is_mutual_follow(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            a = Follow.objects.filter(follower=request.user, following=obj).exists()
            b = Follow.objects.filter(follower=obj, following=request.user).exists()
            return a and b
        return False

    def get_match_percentage(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        
        # Get match data from the view
        match_data = getattr(request, '_match_data', {})
        if obj.id in match_data:
            return match_data[obj.id]['match_percentage']
        
        return 0

    def get_distance(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        
        # Get match data from the view
        match_data = getattr(request, '_match_data', {})
        if obj.id in match_data:
            return match_data[obj.id]['distance']
        
        return 0

    def get_followers_count(self, obj):
        return obj.followers.count()

    def get_following_count(self, obj):
        return obj.following.count()

    def get_posts_count(self, obj):
        return obj.posts.count()

    def calculate_distance(self, lat1, lon1, lat2, lon2):
        """Calculate distance between two coordinates in kilometers"""
        R = 6371  # Earth's radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat/2) * math.sin(dlat/2) +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dlon/2) * math.sin(dlon/2))
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        return R * c

class FollowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following', 'created_at']

class NotificationSerializer(serializers.ModelSerializer):
    from_user = serializers.StringRelatedField(read_only=True)
    timestamp = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id', 'from_user', 'notification_type', 'content', 'is_read', 'created_at', 'timestamp']

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
