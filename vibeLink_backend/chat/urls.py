from django.urls import path
from .views import (
    ConversationListView,
    ConversationDetailView,
    MessageListView,
    start_conversation,
    mark_messages_read
)

urlpatterns = [
    path('conversations/', ConversationListView.as_view(), name='conversation-list'),
    path('conversations/<int:pk>/', ConversationDetailView.as_view(), name='conversation-detail'),
    path('conversations/<int:conversation_id>/messages/', MessageListView.as_view(), name='message-list'),
    path('conversations/start/<int:user_id>/', start_conversation, name='start-conversation'),
    path('conversations/<int:conversation_id>/read/', mark_messages_read, name='mark-messages-read'),
]
