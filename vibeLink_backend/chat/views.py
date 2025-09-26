from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework.pagination import PageNumberPagination
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer, CreateMessageSerializer

User = get_user_model()

class ConversationListView(generics.ListAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(
            participants=self.request.user
        ).prefetch_related('participants', 'messages').distinct()
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class ConversationDetailView(generics.RetrieveAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class MessageListView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    class LatestFirstPagination(PageNumberPagination):
        page_size = 20
        page_query_param = 'page'

        def get_paginated_response(self, data):
            # With newest-first ordering, DRF's "next" is actually the older page.
            # Expose that URL as "previous" to match UI expectation (load older on scroll up).
            older_url = self.get_next_link()
            return Response({
                'count': self.page.paginator.count,
                'next': None,               # No forward pagination for newer-than-first-page
                'previous': older_url,      # Use previous to indicate older messages
                'results': data,
            })

    pagination_class = LatestFirstPagination

    def get_queryset(self):
        conversation_id = self.kwargs['conversation_id']
        conversation = get_object_or_404(Conversation, id=conversation_id, participants=self.request.user)
        # Order latest first for chat view; stable tie-breaker by id
        return (
            Message.objects
            .filter(conversation=conversation)
            .select_related('sender')
            .order_by('-created_at', '-id')
        )

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateMessageSerializer
        return MessageSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        if self.request.method == 'POST':
            conversation_id = self.kwargs['conversation_id']
            context['conversation'] = get_object_or_404(Conversation, id=conversation_id, participants=self.request.user)
        return context

    def perform_create(self, serializer):
        conversation_id = self.kwargs['conversation_id']
        conversation = get_object_or_404(Conversation, id=conversation_id, participants=self.request.user)
        serializer.save(sender=self.request.user, conversation=conversation)

    def create(self, request, *args, **kwargs):
        # Use CreateMessageSerializer for validation
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return the created message using MessageSerializer
        message = serializer.instance
        response_serializer = MessageSerializer(message, context=self.get_serializer_context())
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def start_conversation(request, user_id):
    other_user = get_object_or_404(User, id=user_id)
    
    # Check if conversation already exists
    conversation = Conversation.objects.filter(
        participants=request.user
    ).filter(
        participants=other_user
    ).distinct().first()
    
    if not conversation:
        conversation = Conversation.objects.create()
        conversation.participants.add(request.user, other_user)
    
    serializer = ConversationSerializer(conversation, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_messages_read(request, conversation_id):
    conversation = get_object_or_404(Conversation, id=conversation_id, participants=request.user)
    Message.objects.filter(
        conversation=conversation
    ).exclude(sender=request.user).update(is_read=True)
    
    return Response({'status': 'messages marked as read'})
