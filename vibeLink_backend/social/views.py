from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Q, Count
from .models import Follow, Notification, AIRecommendationCache
from .serializers import UserDiscoverySerializer, FollowSerializer, NotificationSerializer
from .services import get_user_matches, calculate_match_score
# from .ai_matchmaking import ai_matchmaking_service, AIRecommendationsResponse
from rest_framework.views import APIView

User = get_user_model()

class UserDiscoveryView(generics.ListAPIView):
    serializer_class = UserDiscoverySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        current_user = self.request.user
        search = self.request.query_params.get('search', '')
        
        # Get user's default settings
        try:
            user_settings = current_user.settings
            default_radius = user_settings.location_radius
            default_min_age = user_settings.min_age
            default_max_age = user_settings.max_age
        except:
            default_radius = 50
            default_min_age = 18
            default_max_age = 65
        
        # Use query parameters if provided, otherwise use user's default settings
        radius = float(self.request.query_params.get('radius', default_radius))
        min_age = int(self.request.query_params.get('min_age', default_min_age))
        max_age = int(self.request.query_params.get('max_age', default_max_age))

        # Get real matches using our matchmaking service (already uses user settings)
        matches = get_user_matches(current_user, limit=50)
        
        # Filter by search term if provided
        if search:
            matches = [
                match for match in matches 
                if (search.lower() in match['user'].username.lower() or
                    search.lower() in match['user'].first_name.lower() or
                    search.lower() in match['user'].last_name.lower() or
                    (match['user'].bio and search.lower() in match['user'].bio.lower()))
            ]
        
        # Filter by age range
        matches = [
            match for match in matches 
            if match['user'].age and min_age <= match['user'].age <= max_age
        ]
        
        # Filter by distance if radius is specified
        if radius < 200:  # Only apply radius filter if it's not the default
            matches = [
                match for match in matches 
                if match['distance'] is None or match['distance'] <= radius
            ]
        
        # Store match data in the request for the serializer to access
        self.request._match_data = {match['user'].id: match for match in matches}
        
        # Return the user objects from matches
        return [match['user'] for match in matches]

class FollowView(generics.ListCreateAPIView):
    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Follow.objects.filter(follower=self.request.user)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_follow(request, user_id):
    user_to_follow = get_object_or_404(User, id=user_id)
    
    if user_to_follow == request.user:
        return Response({'error': 'Cannot follow yourself'}, status=status.HTTP_400_BAD_REQUEST)
    
    follow, created = Follow.objects.get_or_create(
        follower=request.user,
        following=user_to_follow
    )
    
    if not created:
        follow.delete()
        is_following = False
        
        # Create unfollow notification
        Notification.objects.create(
            user=user_to_follow,
            from_user=request.user,
            notification_type='follow',
            content=f"{request.user.username} unfollowed you"
        )
    else:
        is_following = True
        
        # Create follow notification
        Notification.objects.create(
            user=user_to_follow,
            from_user=request.user,
            notification_type='follow',
            content=f"{request.user.username} started following you"
        )
    
    # Invalidate AI recommendation cache for current user so Discover refreshes
    try:
        AIRecommendationCache.invalidate_user_cache(request.user)
    except Exception:
        pass
    
    return Response({
        'is_following': is_following,
        'followers_count': user_to_follow.followers.count()
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_followers(request, user_id):
    user = get_object_or_404(User, id=user_id)
    followers = user.followers.select_related('follower')
    serializer = UserDiscoverySerializer(followers, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_following(request, user_id):
    user = get_object_or_404(User, id=user_id)
    following = user.following.select_related('following')
    serializer = UserDiscoverySerializer(following, many=True, context={'request': request})
    return Response(serializer.data)

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_notification_read(request, notification_id):
    notification = get_object_or_404(Notification, id=notification_id, user=request.user)
    notification.is_read = True
    notification.save()
    return Response({'status': 'notification marked as read'})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_all_notifications_read(request):
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({'status': 'all notifications marked as read'})

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_notification(request, notification_id):
    notification = get_object_or_404(Notification, id=notification_id, user=request.user)
    notification.delete()
    return Response({'status': 'notification deleted'})

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_all_notifications(request):
    Notification.objects.filter(user=request.user).delete()
    return Response({'status': 'all notifications deleted'})

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_profile(request, user_id):
    """Get a specific user's profile by ID"""
    try:
        user = get_object_or_404(User, id=user_id, is_active=True)
        
        # Get match data for this user
        matches = get_user_matches(request.user, limit=1)
        match_data = None
        for match in matches:
            if match['user'].id == user.id:
                match_data = match
                break
        
        # If not in matches, create basic match data
        if not match_data:
            match_data = {
                'user': user,
                'match_percentage': 0,
                'distance': None
            }
        
        user_data = {
            'id': user.id,
            'username': user.username,
            'full_name': user.get_full_name(),
            'profile_photo': request.build_absolute_uri(user.profile_photo.url) if user.profile_photo else None,
            'bio': user.bio,
            'age': user.age,
            'city': user.city,
            'state': user.state,
            'hashtags': user.hashtags,
            'match_percentage': match_data['match_percentage'],
            'distance': match_data['distance'],
            'is_following': Follow.objects.filter(follower=request.user, following=user).exists(),
            'followers_count': user.followers.count(),
            'following_count': user.following.count(),
            'posts_count': user.posts.count(),
            'date_joined': user.date_joined.isoformat()
        }
        
        return Response(user_data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def top_matches(request):
    """Get top matches for the current user"""
    try:
        matches = get_user_matches(request.user, limit=50)
        
        # Exclude users already followed by current user
        match_data = []
        for match in matches:
            match_data.append({
                'id': match['user'].id,
                'username': match['user'].username,
                'full_name': match['user'].get_full_name(),
                'profile_photo': request.build_absolute_uri(match['user'].profile_photo.url) if match['user'].profile_photo else None,
                'bio': match['user'].bio,
                'age': match['user'].age,
                'city': match['user'].city,
                'state': match['user'].state,
                'hashtags': match['user'].hashtags,
                'match_percentage': match['match_percentage'],
                'distance': match['distance'],
                'is_following': Follow.objects.filter(follower=request.user, following=match['user']).exists(),
                'followers_count': match['user'].followers.count(),
                'following_count': match['user'].following.count(),
                'posts_count': match['user'].posts.count()
            })
        # Filter out followed users and limit to top 6
        match_data = [m for m in match_data if not m['is_following']][:6]
        return Response(match_data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def ai_recommendations(request):
    """Get AI-powered user recommendations with caching to save Gemini API credits"""
    try:
        page = int(request.query_params.get('page', 1))
        per_page = int(request.query_params.get('per_page', 8))
        
        # Validate pagination parameters
        if page < 1:
            page = 1
        if per_page < 1 or per_page > 20:
            per_page = 8
        
        # Check if we have valid cached recommendations
        cached_recommendations = AIRecommendationCache.get_valid_cache(
            request.user, page, per_page
        )
        
        if cached_recommendations:
            # Return cached data
            response_data = {
                'recommendations': cached_recommendations.recommendations_data,
                'pagination': {
                    'page': cached_recommendations.page,
                    'per_page': cached_recommendations.per_page,
                    'total_matches': cached_recommendations.total_matches,
                    'next_page_available': (cached_recommendations.page * cached_recommendations.per_page) < cached_recommendations.total_matches,
                    'total_pages': (cached_recommendations.total_matches + cached_recommendations.per_page - 1) // cached_recommendations.per_page
                },
                'cached': True,
                'cache_created_at': cached_recommendations.created_at.isoformat()
            }
            return Response(response_data, status=status.HTTP_200_OK)
        
        # No valid cache found, generate new recommendations using basic algorithm
        # This is a fallback when AI service is not available or to save credits
        all_matches = get_user_matches(request.user, limit=100)
        
        # Get user's matchmaking preferences
        try:
            user_settings = request.user.settings
            location_radius = user_settings.location_radius
            min_age = user_settings.min_age
            max_age = user_settings.max_age
        except:
            # Default settings if user doesn't have settings
            location_radius = 50
            min_age = 18
            max_age = 65
        
        # Filter matches based on user's preferences
        filtered_matches = []
        for match in all_matches:
            user = match['user']
                # Skip already followed users
            if Follow.objects.filter(follower=request.user, following=user).exists():
                continue
            
            # Age filter
            if user.age and (user.age < min_age or user.age > max_age):
                continue
            
            # Distance filter
            if match.get('distance') and match['distance'] > location_radius:
                continue
            
        filtered_matches.append(match)
        
        # Calculate pagination
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        page_matches = filtered_matches[start_idx:end_idx]
        
        # Generate enhanced recommendations with basic AI-like features
        recommendations_data = []
        for match in page_matches:
            user = match['user']
            match_score = match.get('match_percentage', 0)
            
            # Generate compatibility reasons
            reasons = []
            if user.age and request.user.age:
                age_diff = abs(user.age - request.user.age)
                if age_diff <= 5:
                    reasons.append("Similar age range")
                elif age_diff <= 10:
                    reasons.append("Compatible age range")
            
            if user.hashtags and request.user.hashtags:
                common_hashtags = set(user.hashtags) & set(request.user.hashtags)
                if common_hashtags:
                    reasons.append(f"Shared interests: {', '.join(list(common_hashtags)[:3])}")
            
            if user.city == request.user.city:
                reasons.append("Same city")
            elif user.state == request.user.state:
                reasons.append("Same state")
            
            if not reasons:
                reasons.append("Potential compatibility based on profile")
            
            # Generate conversation starters
            conversation_starters = [
                f"Hi {user.first_name}! I noticed we both like {user.hashtags[0] if user.hashtags else 'similar things'}",
                f"Hello! Your bio about {user.bio[:50] if user.bio else 'your interests'} caught my attention",
                f"Hey {user.first_name}! I see you're from {user.city} - I love that area!"
            ]
            
            # Get shared interests
            shared_interests = []
            if user.hashtags and request.user.hashtags:
                shared_interests = list(set(user.hashtags) & set(request.user.hashtags))
            
            user_data = {
                'id': user.id,
                'username': user.username,
                'full_name': user.get_full_name(),
                'profile_photo': request.build_absolute_uri(user.profile_photo.url) if user.profile_photo else None,
                'bio': user.bio,
                'age': user.age,
                'city': user.city,
                'state': user.state,
                'hashtags': user.hashtags,
                'match_percentage': match_score,
                'distance': match.get('distance'),
                'is_following': Follow.objects.filter(follower=request.user, following=user).exists(),
                'followers_count': user.followers.count(),
                'following_count': user.following.count(),
                'posts_count': user.posts.count(),
                'compatibility_reasons': reasons,
                'conversation_starters': conversation_starters,
                'shared_interests': shared_interests
            }
            recommendations_data.append(user_data)
        
               # Cache the results for future requests
        total_matches = len(filtered_matches)
        AIRecommendationCache.create_cache_entry(
            request.user, page, per_page, recommendations_data, total_matches
        )
        
        response_data = {
            'recommendations': recommendations_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total_matches': total_matches,
                'next_page_available': end_idx < total_matches,
                'total_pages': (total_matches + per_page - 1) // per_page
            },
            'cached': False
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def invalidate_ai_cache(request):
    """Manually invalidate AI recommendation cache for the current user"""
    try:
        AIRecommendationCache.invalidate_user_cache(request.user)
        return Response({
            'message': 'AI recommendation cache invalidated successfully',
            'user_id': request.user.id
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SearchView(APIView):
    """
    Search for users, posts, and hashtags
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        query = request.GET.get('q', '').strip()
        
        if not query:
            return Response({'results': []}, status=status.HTTP_200_OK)
        
        results = []
        
        try:
            # Search users
            users = User.objects.filter(
                Q(username__icontains=query) | 
                Q(first_name__icontains=query) | 
                Q(last_name__icontains=query)
            ).exclude(id=request.user.id)[:5]
            
            for user in users:
                full_name = f"{user.first_name} {user.last_name}".strip() if user.first_name or user.last_name else None
                results.append({
                    'id': user.id,
                    'type': 'user',
                    'title': full_name or user.username,
                    'subtitle': f'@{user.username}',
                    'image': user.profile_photo.url if user.profile_photo else None,
                    'data': {
                        'id': user.id,
                        'username': user.username,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'full_name': full_name,
                        'profile_photo': user.profile_photo.url if user.profile_photo else None,
                        'bio': user.bio,
                        'city': user.city,
                        'state': user.state
                    }
                })
            
            # Search posts
            from posts.models import Post
            posts = Post.objects.filter(
                Q(content__icontains=query)
            ).select_related('user').order_by('-created_at')[:5]
            
            for post in posts:
                user_full_name = f"{post.user.first_name} {post.user.last_name}".strip() if post.user.first_name or post.user.last_name else None
                results.append({
                    'id': post.id,
                    'type': 'post',
                    'title': post.content[:50] + ('...' if len(post.content) > 50 else ''),
                    'subtitle': f'by {user_full_name or post.user.username}',
                    'image': post.user.profile_photo.url if post.user.profile_photo else None,
                    'data': {
                        'id': post.id,
                        'content': post.content,
                        'user': {
                            'id': post.user.id,
                            'username': post.user.username,
                            'first_name': post.user.first_name,
                            'last_name': post.user.last_name,
                            'full_name': user_full_name,
                            'profile_photo': post.user.profile_photo.url if post.user.profile_photo else None
                        },
                        'created_at': post.created_at,
                        'likes_count': post.likes_count,
                        'shares_count': post.shares_count
                    }
                })
            
            # Search hashtags (extract from post content)
            hashtag_pattern = r'#(\w+)'
            import re
            hashtags = set()
            for post in Post.objects.filter(content__icontains='#'):
                matches = re.findall(hashtag_pattern, post.content, re.IGNORECASE)
                for match in matches:
                    if query.lower() in match.lower():
                        hashtags.add(match)
            
            for hashtag in list(hashtags)[:3]:
                # Count posts with this hashtag
                hashtag_posts = Post.objects.filter(content__icontains=f'#{hashtag}')
                results.append({
                    'id': hash(hashtag),  # Use hash as ID for hashtags
                    'type': 'hashtag',
                    'title': f'#{hashtag}',
                    'subtitle': f'{hashtag_posts.count()} posts',
                    'data': {
                        'name': hashtag,
                        'post_count': hashtag_posts.count()
                    }
                })
            
            return Response({'results': results}, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
