from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import AIRecommendationCache

User = get_user_model()

@receiver(post_save, sender=User)
def invalidate_ai_cache_on_user_update(sender, instance, **kwargs):
    """
    Invalidate AI recommendation cache when user profile is updated
    """
    # Only invalidate if certain fields that affect recommendations are updated
    if kwargs.get('update_fields'):
        # Check if any relevant fields were updated
        relevant_fields = {
            'hashtags', 'city', 'state', 'latitude', 'longitude', 
            'age', 'bio', 'first_name', 'last_name'
        }
        if any(field in kwargs['update_fields'] for field in relevant_fields):
            AIRecommendationCache.invalidate_user_cache(instance)
    else:
        # If no specific fields mentioned, invalidate cache to be safe
        AIRecommendationCache.invalidate_user_cache(instance)

@receiver(post_save, sender=User)
def invalidate_ai_cache_on_settings_update(sender, instance, **kwargs):
    """
    Invalidate AI recommendation cache when user settings are updated
    This will be triggered when the user's settings model is updated
    """
    try:
        # Check if user has settings and they were updated
        if hasattr(instance, 'settings'):
            AIRecommendationCache.invalidate_user_cache(instance)
    except:
        pass

def invalidate_cache_for_user(user):
    """
    Utility function to manually invalidate cache for a user
    Can be called from views when settings are updated
    """
    AIRecommendationCache.invalidate_user_cache(user)
