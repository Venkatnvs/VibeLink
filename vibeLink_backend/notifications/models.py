from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class EmailNotification(models.Model):
    NOTIFICATION_TYPES = [
        ('like', 'Post Liked'),
        ('share', 'Post Shared'),
        ('follow', 'User Followed'),
        ('message', 'New Message'),
        ('comment', 'Post Commented'),
        ('match', 'New Match'),
        ('welcome', 'Welcome'),
        ('system', 'System'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
        ('delivered', 'Delivered'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    from_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='email_notifications_sent')
    related_object_id = models.PositiveIntegerField(null=True, blank=True)  # ID of related post, user, etc.
    related_object_type = models.CharField(max_length=50, null=True, blank=True)  # 'post', 'user', 'message', etc.
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['notification_type']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.get_notification_type_display()} - {self.status}"
    
    def mark_as_sent(self):
        self.status = 'sent'
        self.sent_at = timezone.now()
        self.save()
    
    def mark_as_delivered(self):
        self.status = 'delivered'
        self.delivered_at = timezone.now()
        self.save()
    
    def mark_as_failed(self, error_message=None):
        self.status = 'failed'
        if error_message:
            self.error_message = error_message
        self.save()
