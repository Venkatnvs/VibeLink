from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Conversation, Message

User = get_user_model()

class MessageUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    profile_photo = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'profile_photo']

    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_profile_photo(self, obj):
        if obj.profile_photo:
            request = self.context.get('request')
            if request:
                try:
                    # Handle both FileField and string URL cases
                    if hasattr(obj.profile_photo, 'url'):
                        return request.build_absolute_uri(obj.profile_photo.url)
                    else:
                        # If it's already a URL string, make it absolute
                        if obj.profile_photo.startswith('/'):
                            return request.build_absolute_uri(obj.profile_photo)
                        return obj.profile_photo
                except:
                    return None
            # Fallback for when no request context
            if hasattr(obj.profile_photo, 'url'):
                return obj.profile_photo.url
            return obj.profile_photo
        return None

class MessageSerializer(serializers.ModelSerializer):
    sender = MessageUserSerializer(read_only=True)
    timestamp = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'sender', 'content', 'is_read', 'created_at', 'timestamp']

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

class ConversationSerializer(serializers.ModelSerializer):
    participants = MessageUserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    other_participant = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'participants', 'last_message', 'unread_count', 'other_participant', 'created_at', 'updated_at']

    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return {
                'content': last_msg.content,
                'sender': last_msg.sender.username,
                'timestamp': last_msg.created_at
            }
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0

    def get_other_participant(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            other = obj.participants.exclude(id=request.user.id).first()
            if other:
                return MessageUserSerializer(other, context=self.context).data
        return None

class CreateMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['content']

    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        validated_data['conversation'] = self.context['conversation']
        return super().create(validated_data)
