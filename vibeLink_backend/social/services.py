import math
from typing import List, Dict, Any
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import Follow
from settings.models import UserSettings

User = get_user_model()

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points using Haversine formula"""
    if not all([lat1, lon1, lat2, lon2]):
        return float('inf')
    
    # Convert latitude and longitude from degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    # Radius of earth in kilometers
    r = 6371
    return c * r

def calculate_age_compatibility(user1_age: int, user2_age: int, user1_settings: UserSettings, user2_settings: UserSettings) -> float:
    """Calculate age compatibility score (0-1)"""
    if not user1_age or not user2_age:
        return 0.0
    
    # Check if users are within each other's age preferences
    user1_in_range = user1_settings.min_age <= user2_age <= user1_settings.max_age
    user2_in_range = user2_settings.min_age <= user1_age <= user2_settings.max_age
    
    if not (user1_in_range and user2_in_range):
        return 0.0
    
    # Calculate age difference score (closer ages = higher score)
    age_diff = abs(user1_age - user2_age)
    max_age_diff = max(user1_settings.max_age - user1_settings.min_age, 
                      user2_settings.max_age - user2_settings.min_age)
    
    if max_age_diff == 0:
        return 1.0
    
    age_score = 1.0 - (age_diff / max_age_diff)
    return max(0.0, age_score)

def calculate_location_compatibility(user1_lat: float, user1_lon: float, user2_lat: float, user2_lon: float, 
                                  user1_settings: UserSettings, user2_settings: UserSettings) -> float:
    """Calculate location compatibility score (0-1)"""
    if not all([user1_lat, user1_lon, user2_lat, user2_lon]):
        return 0.0
    
    distance = calculate_distance(user1_lat, user1_lon, user2_lat, user2_lon)
    
    # Use the smaller radius preference
    max_radius = min(user1_settings.location_radius, user2_settings.location_radius)
    
    if distance > max_radius:
        return 0.0
    
    # Closer distance = higher score
    location_score = 1.0 - (distance / max_radius)
    return max(0.0, location_score)

def calculate_hashtag_compatibility(user1_hashtags: List[str], user2_hashtags: List[str]) -> float:
    """Calculate hashtag compatibility score (0-1)"""
    if not user1_hashtags or not user2_hashtags:
        return 0.0
    
    # Convert to lowercase for case-insensitive comparison
    user1_tags = set(tag.lower() for tag in user1_hashtags)
    user2_tags = set(tag.lower() for tag in user2_hashtags)
    
    if not user1_tags or not user2_tags:
        return 0.0
    
    # Calculate Jaccard similarity
    intersection = len(user1_tags.intersection(user2_tags))
    union = len(user1_tags.union(user2_tags))
    
    if union == 0:
        return 0.0
    
    return intersection / union

def calculate_bio_compatibility(user1_bio: str, user2_bio: str) -> float:
    """Calculate bio compatibility score (0-1) based on common words"""
    if not user1_bio or not user2_bio:
        return 0.0
    
    # Simple word-based similarity
    user1_words = set(user1_bio.lower().split())
    user2_words = set(user2_bio.lower().split())
    
    if not user1_words or not user2_words:
        return 0.0
    
    # Remove common words
    common_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall'}
    user1_words = user1_words - common_words
    user2_words = user2_words - common_words
    
    if not user1_words or not user2_words:
        return 0.0
    
    intersection = len(user1_words.intersection(user2_words))
    union = len(user1_words.union(user2_words))
    
    if union == 0:
        return 0.0
    
    return intersection / union

def calculate_match_score(user1: User, user2: User) -> Dict[str, Any]:
    """Calculate overall match score between two users"""
    try:
        user1_settings = user1.settings
        user2_settings = user2.settings
    except UserSettings.DoesNotExist:
        # Create default settings if they don't exist
        user1_settings = UserSettings.objects.create(user=user1)
        user2_settings = UserSettings.objects.create(user=user2)
    
    # Calculate individual compatibility scores
    age_score = calculate_age_compatibility(
        user1.age, user2.age, user1_settings, user2_settings
    )
    
    location_score = calculate_location_compatibility(
        user1.latitude, user1.longitude, user2.latitude, user2.longitude,
        user1_settings, user2_settings
    )
    
    hashtag_score = calculate_hashtag_compatibility(
        user1.hashtags or [], user2.hashtags or []
    )
    
    bio_score = calculate_bio_compatibility(
        user1.bio or '', user2.bio or ''
    )
    
    # Weighted overall score
    weights = {
        'age': 0.3,
        'location': 0.25,
        'hashtags': 0.25,
        'bio': 0.2
    }
    
    overall_score = (
        age_score * weights['age'] +
        location_score * weights['location'] +
        hashtag_score * weights['hashtags'] +
        bio_score * weights['bio']
    )
    
    # Calculate distance
    distance = calculate_distance(
        user1.latitude, user1.longitude, user2.latitude, user2.longitude
    ) if all([user1.latitude, user1.longitude, user2.latitude, user2.longitude]) else None
    
    return {
        'overall_score': round(overall_score * 100, 1),  # Convert to percentage
        'age_score': round(age_score * 100, 1),
        'location_score': round(location_score * 100, 1),
        'hashtag_score': round(hashtag_score * 100, 1),
        'bio_score': round(bio_score * 100, 1),
        'distance': round(distance, 1) if distance is not None else None,
        'is_compatible': overall_score > 0.3  # Minimum compatibility threshold
    }

def get_user_matches(user: User, limit: int = 10) -> List[Dict[str, Any]]:
    """Get top matches for a user"""
    try:
        user_settings = user.settings
        location_radius = user_settings.location_radius
        min_age = user_settings.min_age
        max_age = user_settings.max_age
    except UserSettings.DoesNotExist:
        user_settings = UserSettings.objects.create(user=user)
        location_radius = 50
        min_age = 18
        max_age = 65
    
    # Get users within location radius and age range
    if user.latitude and user.longitude:
        # This is a simplified query - in production, you'd use PostGIS for better performance
        all_users = User.objects.exclude(id=user.id).filter(
            latitude__isnull=False,
            longitude__isnull=False,
            is_active=True,
            age__gte=min_age,
            age__lte=max_age
        )
    else:
        all_users = User.objects.exclude(id=user.id).filter(
            is_active=True,
            age__gte=min_age,
            age__lte=max_age
        )
    
    # Calculate match scores
    matches = []
    for other_user in all_users:
        match_data = calculate_match_score(user, other_user)
        
        # Additional distance filtering based on user's location radius preference
        if match_data['distance'] and match_data['distance'] > location_radius:
            continue
            
        if match_data['is_compatible']:
            matches.append({
                'user': other_user,
                'match_percentage': match_data['overall_score'],
                'distance': match_data['distance'],
                'scores': {
                    'age': match_data['age_score'],
                    'location': match_data['location_score'],
                    'hashtags': match_data['hashtag_score'],
                    'bio': match_data['bio_score']
                }
            })
    
    # Sort by distance (nearest first), then by match percentage as secondary sort
    matches.sort(key=lambda x: (x['distance'] if x['distance'] is not None else float('inf'), -x['match_percentage']))
    return matches[:limit]
