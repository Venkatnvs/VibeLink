from django.urls import path
from .views import (
    UserDiscoveryView,
    FollowView,
    toggle_follow,
    get_followers,
    get_following,
    NotificationListView,
    mark_notification_read,
    mark_all_notifications_read,
    delete_notification,
    delete_all_notifications,
    get_user_profile,
    top_matches,
    ai_recommendations,
    invalidate_ai_cache,
    SearchView
)

urlpatterns = [
    path('discover/', UserDiscoveryView.as_view(), name='user-discovery'),
    path('follows/', FollowView.as_view(), name='follow-list'),
    path('follow/<int:user_id>/', toggle_follow, name='toggle-follow'),
    path('followers/<int:user_id>/', get_followers, name='get-followers'),
    path('following/<int:user_id>/', get_following, name='get-following'),
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:notification_id>/read/', mark_notification_read, name='mark-notification-read'),
    path('notifications/read-all/', mark_all_notifications_read, name='mark-all-notifications-read'),
    path('notifications/<int:notification_id>/delete/', delete_notification, name='delete-notification'),
    path('notifications/delete-all/', delete_all_notifications, name='delete-all-notifications'),
    path('user/<int:user_id>/', get_user_profile, name='get-user-profile'),
    path('top-matches/', top_matches, name='top-matches'),
    path('ai-recommendations/', ai_recommendations, name='ai-recommendations'),
    path('ai-recommendations/invalidate/', invalidate_ai_cache, name='invalidate-ai-cache'),
    path('search/', SearchView.as_view(), name='search'),
]
