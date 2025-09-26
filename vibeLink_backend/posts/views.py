from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import Post, PostLike, PostShare
from .serializers import PostSerializer, CreatePostSerializer
from social.models import Follow

User = get_user_model()

class PostListCreateView(generics.ListCreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Post.objects.select_related('user').prefetch_related('likes', 'shares').all()

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreatePostSerializer
        return PostSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        post = serializer.save(user=request.user)
        
        # Return the full post data with user information
        full_serializer = PostSerializer(post, context={'request': request})
        return Response(full_serializer.data, status=status.HTTP_201_CREATED)

class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Post.objects.select_related('user').prefetch_related('likes', 'shares').all()

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return CreatePostSerializer
        return PostSerializer

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_like(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    like, created = PostLike.objects.get_or_create(user=request.user, post=post)
    
    if not created:
        like.delete()
        post.likes_count = max(0, post.likes_count - 1)
        is_liked = False
    else:
        post.likes_count += 1
        is_liked = True
    
    post.save()
    
    return Response({
        'is_liked': is_liked,
        'likes_count': post.likes_count
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_share(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    share, created = PostShare.objects.get_or_create(user=request.user, post=post)
    
    if not created:
        share.delete()
        post.shares_count = max(0, post.shares_count - 1)
        is_shared = False
    else:
        post.shares_count += 1
        is_shared = True
    
    post.save()
    
    return Response({
        'is_shared': is_shared,
        'shares_count': post.shares_count
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_posts(request, user_id):
    user = get_object_or_404(User, id=user_id)
    posts = Post.objects.filter(user=user).select_related('user').prefetch_related('likes', 'shares').order_by('-created_at')
    serializer = PostSerializer(posts, many=True, context={'request': request})
    return Response({
        'count': posts.count(),
        'next': None,
        'previous': None,
        'results': serializer.data
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def follower_posts(request):
    """Get posts from users that the current user follows, including the current user's own posts"""
    # Get the IDs of users that the current user follows
    following_ids = Follow.objects.filter(follower=request.user).values_list('following_id', flat=True)
    
    # Include the current user's own posts as well
    all_user_ids = list(following_ids) + [request.user.id]
    
    # Get posts from followed users and current user, ordered by creation date (most recent first)
    posts = Post.objects.filter(
        user_id__in=all_user_ids
    ).select_related('user').prefetch_related('likes', 'shares').order_by('-created_at')
    
    serializer = PostSerializer(posts, many=True, context={'request': request})
    return Response(serializer.data)
