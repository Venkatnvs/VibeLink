from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import EmailNotification

User = get_user_model()

class EmailNotificationSerializer(serializers.ModelSerializer):
    from_user_name = serializers.SerializerMethodField()
    timestamp = serializers.SerializerMethodField()
    
    class Meta:
        model = EmailNotification
        fields = [
            'id', 'notification_type', 'subject', 'message', 'from_user_name',
            'related_object_id', 'related_object_type', 'status', 'sent_at',
            'delivered_at', 'created_at', 'timestamp'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_from_user_name(self, obj):
        if obj.from_user:
            return obj.from_user.get_full_name() or obj.from_user.username
        return None
    
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

class CreateEmailNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailNotification
        fields = [
            'user', 'notification_type', 'subject', 'message', 'from_user',
            'related_object_id', 'related_object_type'
        ]
    
    def create(self, validated_data):
        return EmailNotification.objects.create(**validated_data)
