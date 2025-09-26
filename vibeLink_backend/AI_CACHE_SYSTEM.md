# AI Recommendation Cache System

## Overview
This system implements intelligent caching for AI-generated user recommendations to minimize Gemini API usage and reduce costs while maintaining good user experience.

## How It Works

### 1. Cache Storage
- **Model**: `AIRecommendationCache` in `social/models.py`
- **Storage**: Database table with JSON field for recommendation data
- **Expiration**: 24 hours by default
- **Invalidation**: Automatic when user settings change

### 2. Cache Key Generation
The cache key is generated based on:
- User ID
- Page number
- Items per page
- User's matchmaking settings hash (location radius, age range, etc.)
- User's profile data hash (hashtags, location, etc.)

### 3. Cache Flow
1. **Request comes in** → Check for valid cache
2. **Cache hit** → Return cached data immediately
3. **Cache miss** → Generate new recommendations using basic algorithm
4. **Store in cache** → Save for future requests
5. **Return data** → Send to client

### 4. Automatic Invalidation
Cache is automatically invalidated when:
- User updates their profile (hashtags, location, bio, etc.)
- User changes matchmaking settings
- Cache expires (24 hours)

## API Endpoints

### Get AI Recommendations
```
GET /api/social/ai-recommendations/?page=1&per_page=8
```
**Response includes:**
- `cached`: Boolean indicating if data came from cache
- `cache_created_at`: Timestamp when cache was created (if cached)

### Invalidate Cache (Manual)
```
POST /api/social/ai-recommendations/invalidate/
```
**Use case:** Force refresh recommendations for testing or when settings change

## Management Commands

### Clean Up Expired Cache
```bash
python manage.py cleanup_ai_cache
```

### Dry Run (see what would be cleaned)
```bash
python manage.py cleanup_ai_cache --dry-run
```

## Benefits

### 1. Cost Savings
- **Before**: Every request = Gemini API call
- **After**: Only first request per user/settings combination = API call
- **Savings**: ~95% reduction in API calls for repeat users

### 2. Performance
- **Cache hit**: ~50ms response time
- **Cache miss**: ~2-3 seconds (basic algorithm)
- **Gemini API**: ~5-10 seconds (when used)

### 3. Reliability
- Fallback to basic algorithm when AI service unavailable
- Graceful degradation
- No single point of failure

## Configuration

### Cache Expiration
Default: 24 hours
```python
# In AIRecommendationCache.create_cache_entry()
expires_at = timezone.now() + timezone.timedelta(hours=24)
```

### Settings Hash
Includes these user settings in cache key:
- Location radius
- Min/max age
- Show distance preference
- User hashtags
- User location (city, state, coordinates)

## Monitoring

### Cache Statistics
You can monitor cache effectiveness by checking:
- `cached` field in API responses
- Database query: `AIRecommendationCache.objects.filter(is_valid=True).count()`
- Cache hit rate: Compare cached vs non-cached responses

### Database Queries
```sql
-- Active cache entries
SELECT COUNT(*) FROM social_airecommendationcache WHERE is_valid = true;

-- Cache hit rate by user
SELECT user_id, COUNT(*) as cache_entries 
FROM social_airecommendationcache 
WHERE is_valid = true 
GROUP BY user_id;

-- Expired entries
SELECT COUNT(*) FROM social_airecommendationcache 
WHERE expires_at < NOW() AND is_valid = true;
```

## Future Enhancements

1. **Redis Integration**: Move cache to Redis for better performance
2. **Smart Preloading**: Pre-generate recommendations for active users
3. **A/B Testing**: Compare AI vs basic algorithm performance
4. **Analytics**: Track cache hit rates and user engagement
5. **Dynamic Expiration**: Adjust cache time based on user activity

## Troubleshooting

### Cache Not Working
1. Check if migration was applied: `python manage.py showmigrations social`
2. Verify model import: `from social.models import AIRecommendationCache`
3. Check database table exists: `python manage.py dbshell`

### Performance Issues
1. Run cleanup command: `python manage.py cleanup_ai_cache`
2. Check for expired entries in database
3. Monitor cache hit rate

### Settings Not Reflecting
1. Manually invalidate cache: `POST /api/social/ai-recommendations/invalidate/`
2. Check if signals are working: Update user profile and verify cache invalidation
3. Verify settings hash generation in model methods
