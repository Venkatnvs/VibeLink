from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import UserSettings

# Invalidate AI cache when settings change
try:
    from social.models import AIRecommendationCache
except Exception:
    AIRecommendationCache = None  # social may not be ready during migrations


@receiver(post_save, sender=UserSettings)
def invalidate_ai_cache_on_settings_change(sender, instance: UserSettings, **kwargs):
    if AIRecommendationCache is None:
        return
    user = instance.user
    # Mark existing cache entries invalid so they refresh next call
    AIRecommendationCache.invalidate_user_cache(user)


