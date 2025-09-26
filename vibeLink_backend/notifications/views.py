from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from .models import EmailNotification
from .serializers import EmailNotificationSerializer, CreateEmailNotificationSerializer

User = get_user_model()

class EmailNotificationListCreateView(generics.ListCreateAPIView):
    serializer_class = EmailNotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return EmailNotification.objects.filter(user=self.request.user).select_related('from_user')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateEmailNotificationSerializer
        return EmailNotificationSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class EmailNotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EmailNotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return EmailNotification.objects.filter(user=self.request.user)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_notifications(request):
    """Get paginated list of email notifications for the current user"""
    notifications = EmailNotification.objects.filter(user=request.user).select_related('from_user')
    
    # Filter by status if provided
    status_filter = request.query_params.get('status')
    if status_filter:
        notifications = notifications.filter(status=status_filter)
    
    # Filter by notification type if provided
    notification_type = request.query_params.get('type')
    if notification_type:
        notifications = notifications.filter(notification_type=notification_type)
    
    # Order by most recent first
    notifications = notifications.order_by('-created_at')
    
    # Paginate
    from django.core.paginator import Paginator
    paginator = Paginator(notifications, 20)  # 20 notifications per page
    page_number = request.query_params.get('page', 1)
    page_obj = paginator.get_page(page_number)
    
    serializer = EmailNotificationSerializer(page_obj, many=True)
    
    return Response({
        'count': paginator.count,
        'next': page_obj.next_page_number() if page_obj.has_next() else None,
        'previous': page_obj.previous_page_number() if page_obj.has_previous() else None,
        'results': serializer.data
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_notification_read(request, notification_id):
    """Mark a notification as read (delivered)"""
    notification = get_object_or_404(EmailNotification, id=notification_id, user=request.user)
    notification.mark_as_delivered()
    return Response({'status': 'success', 'message': 'Notification marked as read'})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_all_notifications_read(request):
    """Mark all notifications as read for the current user"""
    EmailNotification.objects.filter(
        user=request.user,
        status__in=['pending', 'sent']
    ).update(
        status='delivered',
        delivered_at=timezone.now()
    )
    return Response({'status': 'success', 'message': 'All notifications marked as read'})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def send_test_notification(request):
    """Send a test email notification"""
    try:
        # Create notification record
        notification = EmailNotification.objects.create(
            user=request.user,
            notification_type='system',
            subject='Test Notification',
            message='This is a test notification from VibeLink.',
            status='pending'
        )
        
        # Send email
        send_mail(
            subject=notification.subject,
            message=notification.message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[request.user.email],
            fail_silently=False,
        )
        
        # Mark as sent
        notification.mark_as_sent()
        
        return Response({
            'status': 'success',
            'message': 'Test notification sent successfully',
            'notification_id': notification.id
        })
        
    except Exception as e:
        notification.mark_as_failed(str(e))
        return Response({
            'status': 'error',
            'message': f'Failed to send notification: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_notification(request):
    """Create a new email notification"""
    serializer = CreateEmailNotificationSerializer(data=request.data)
    if serializer.is_valid():
        notification = serializer.save(user=request.user)
        
        # Try to send email immediately
        try:
            send_mail(
                subject=notification.subject,
                message=notification.message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[notification.user.email],
                fail_silently=False,
            )
            notification.mark_as_sent()
        except Exception as e:
            notification.mark_as_failed(str(e))
        
        return Response(EmailNotificationSerializer(notification).data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
