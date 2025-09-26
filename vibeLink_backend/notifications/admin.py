from django.contrib import admin
from .models import EmailNotification

@admin.register(EmailNotification)
class EmailNotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'notification_type', 'subject', 'status', 'created_at', 'sent_at']
    list_filter = ['notification_type', 'status', 'created_at']
    search_fields = ['user__username', 'user__email', 'subject', 'message']
    readonly_fields = ['created_at', 'updated_at', 'sent_at', 'delivered_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'notification_type', 'subject', 'message')
        }),
        ('Related Objects', {
            'fields': ('from_user', 'related_object_id', 'related_object_type'),
            'classes': ('collapse',)
        }),
        ('Status & Timing', {
            'fields': ('status', 'sent_at', 'delivered_at', 'error_message'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'from_user')
