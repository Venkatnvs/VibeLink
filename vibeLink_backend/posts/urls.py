from django.urls import path
from .views import (
    PostListCreateView,
    PostDetailView,
    toggle_like,
    toggle_share,
    user_posts,
    follower_posts
)

urlpatterns = [
    path('', PostListCreateView.as_view(), name='post-list-create'),
    path('<int:pk>/', PostDetailView.as_view(), name='post-detail'),
    path('<int:post_id>/like/', toggle_like, name='post-like'),
    path('<int:post_id>/share/', toggle_share, name='post-share'),
    path('user/<int:user_id>/', user_posts, name='user-posts'),
    path('followers/', follower_posts, name='follower-posts'),
]
