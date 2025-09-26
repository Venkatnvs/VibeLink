from django.urls import path
from . import views

urlpatterns = [
    path('', views.EmailNotificationListCreateView.as_view(), name='email-notification-list'),
    path('<int:pk>/', views.EmailNotificationDetailView.as_view(), name='email-notification-detail'),
    path('list/', views.get_notifications, name='email-notification-list-paginated'),
    path('<int:notification_id>/read/', views.mark_notification_read, name='mark-notification-read'),
    path('read-all/', views.mark_all_notifications_read, name='mark-all-notifications-read'),
    path('send-test/', views.send_test_notification, name='send-test-notification'),
    path('create/', views.create_notification, name='create-notification'),
]
