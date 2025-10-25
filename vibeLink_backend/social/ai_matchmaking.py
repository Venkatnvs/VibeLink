import os
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from django.conf import settings
from django.contrib.auth import get_user_model
from .services import calculate_match_score, get_user_matches

User = get_user_model()

# Configure Gemini API
os.environ["GOOGLE_API_KEY"] = getattr(settings, 'GEMINI_API_KEY', 'AIzaSyAoBmd8UiGipb9TZ6C4YmDP2EELMGyNeqI')

class UserRecommendation(BaseModel):
    """Structured output for user recommendations"""
    user_id: int = Field(description="The ID of the recommended user")
    match_percentage: float = Field(description="Match percentage (0-100)")
    compatibility_reasons: List[str] = Field(description="List of reasons why this user is a good match")
    conversation_starters: List[str] = Field(description="Suggested conversation starters")
    shared_interests: List[str] = Field(description="Common interests or hashtags")
    distance_km: Optional[float] = Field(description="Distance in kilometers if available")

class AIRecommendationsResponse(BaseModel):
    """Structured output for AI recommendations response"""
    recommendations: List[UserRecommendation] = Field(description="List of user recommendations")
    total_matches: int = Field(description="Total number of potential matches found")
    next_page_available: bool = Field(description="Whether there are more recommendations available")
    page_number: int = Field(description="Current page number")
    recommendations_per_page: int = Field(description="Number of recommendations per page")

class AIMatchmakingService:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0.3,
            max_output_tokens=2048
        )
        self.parser = PydanticOutputParser(pydantic_object=AIRecommendationsResponse)
        
    def create_user_profile_summary(self, user: User) -> str:
        """Create a comprehensive profile summary for AI analysis"""
        profile_parts = []
        
        # Basic info
        profile_parts.append(f"Name: {user.get_full_name()}")
        profile_parts.append(f"Age: {user.age}")
        profile_parts.append(f"Location: {user.city}, {user.state}")
        
        if user.bio:
            profile_parts.append(f"Bio: {user.bio}")
        
        if user.hashtags:
            profile_parts.append(f"Interests: {', '.join(user.hashtags)}")
        
        # Activity info
        posts_count = user.posts.count()
        followers_count = user.followers.count()
        following_count = user.following.count()
        
        profile_parts.append(f"Activity: {posts_count} posts, {followers_count} followers, {following_count} following")
        
        return "\n".join(profile_parts)
    
    def create_match_analysis_prompt(self, current_user: User, potential_matches: List[Dict]) -> str:
        """Create a prompt for AI to analyze potential matches"""
        
        current_user_profile = self.create_user_profile_summary(current_user)
        
        # Create profiles for potential matches
        match_profiles = []
        for match in potential_matches:
            user = match['user']
            profile = f"""
User ID: {user.id}
Name: {user.get_full_name()}
Age: {user.age}
Location: {user.city}, {user.state}
Bio: {user.bio or 'No bio provided'}
Interests: {', '.join(user.hashtags) if user.hashtags else 'No interests listed'}
Distance: {match.get('distance', 'Unknown')} km
Current Match Score: {match.get('match_percentage', 0)}%
"""
            match_profiles.append(profile)
        
        prompt = f"""
You are an expert matchmaking AI for a social networking app. Analyze the following user profiles and provide intelligent recommendations.

CURRENT USER PROFILE:
{current_user_profile}

POTENTIAL MATCHES:
{chr(10).join(match_profiles)}

Your task is to:
1. Analyze each potential match based on compatibility factors
2. Provide personalized match percentages (0-100)
3. Give specific reasons why each user would be a good match
4. Suggest conversation starters for each match
5. Identify shared interests and commonalities
6. Consider location, age, interests, bio content, and activity levels

Focus on:
- Compatibility in interests and lifestyle
- Geographic proximity and feasibility
- Age appropriateness
- Shared values and personality traits
- Conversation potential
- Activity level compatibility

Provide 5-10 high-quality recommendations with detailed analysis.
"""
        
        return prompt
    
    def get_ai_recommendations(
        self, 
        current_user: User, 
        page: int = 1, 
        per_page: int = 8
    ) -> AIRecommendationsResponse:
        """Get AI-powered user recommendations with pagination"""
        
        # Get user's matchmaking preferences from settings
        try:
            user_settings = current_user.settings
            location_radius = user_settings.location_radius
            min_age = user_settings.min_age
            max_age = user_settings.max_age
        except:
            # Default settings if user doesn't have settings
            location_radius = 50
            min_age = 18
            max_age = 65
        
        # Get potential matches using our existing algorithm with user preferences
        all_matches = get_user_matches(current_user, limit=100)  # Get more for AI to choose from
        
        # Filter matches based on user's matchmaking preferences
        filtered_matches = []
        for match in all_matches:
            user = match['user']
            
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
        
        if not page_matches:
            return AIRecommendationsResponse(
                recommendations=[],
                total_matches=0,
                next_page_available=False,
                page_number=page,
                recommendations_per_page=per_page
            )
        
        # Create AI analysis prompt
        prompt_text = self.create_match_analysis_prompt(current_user, page_matches)
        
        # Create the prompt template
        prompt = ChatPromptTemplate.from_template(
            "{prompt}\n\n{format_instructions}"
        )
        
        # Format instructions for structured output
        format_instructions = self.parser.get_format_instructions()
        
        # Create the chain
        chain = prompt | self.llm | self.parser
        
        try:
            # Get AI recommendations
            response = chain.invoke({
                "prompt": prompt_text,
                "format_instructions": format_instructions
            })
            
            # Check if there are more matches available
            total_matches = len(filtered_matches)
            next_page_available = end_idx < total_matches
            
            # Update the response with pagination info
            response.total_matches = total_matches
            response.next_page_available = next_page_available
            response.page_number = page
            response.recommendations_per_page = per_page
            
            return response
            
        except Exception as e:
            # Fallback to basic recommendations if AI fails
            print(f"AI recommendation failed: {e}")
            return self._create_fallback_recommendations(
                current_user, page_matches, page, per_page, len(filtered_matches)
            )
    
    def _create_fallback_recommendations(
        self, 
        current_user: User, 
        matches: List[Dict], 
        page: int, 
        per_page: int, 
        total_matches: int
    ) -> AIRecommendationsResponse:
        """Create fallback recommendations using basic algorithm"""
        
        recommendations = []
        for match in matches:
            user = match['user']
            match_score = match.get('match_percentage', 0)
            
            # Basic compatibility reasons
            reasons = []
            if user.age and current_user.age:
                age_diff = abs(user.age - current_user.age)
                if age_diff <= 5:
                    reasons.append("Similar age range")
                elif age_diff <= 10:
                    reasons.append("Compatible age range")
            
            if user.hashtags and current_user.hashtags:
                common_hashtags = set(user.hashtags) & set(current_user.hashtags)
                if common_hashtags:
                    reasons.append(f"Shared interests: {', '.join(list(common_hashtags)[:3])}")
            
            if user.city == current_user.city:
                reasons.append("Same city")
            elif user.state == current_user.state:
                reasons.append("Same state")
            
            if not reasons:
                reasons.append("Potential compatibility based on profile")
            
            # Basic conversation starters
            conversation_starters = [
                f"Hi {user.first_name}! I noticed we both like {user.hashtags[0] if user.hashtags else 'similar things'}",
                f"Hello! Your bio about {user.bio[:50] if user.bio else 'your interests'} caught my attention",
                f"Hey {user.first_name}! I see you're from {user.city} - I love that area!"
            ]
            
            recommendations.append(UserRecommendation(
                user_id=user.id,
                match_percentage=match_score,
                compatibility_reasons=reasons,
                conversation_starters=conversation_starters,
                shared_interests=list(common_hashtags) if 'common_hashtags' in locals() else [],
                distance_km=match.get('distance')
            ))
        
        return AIRecommendationsResponse(
            recommendations=recommendations,
            total_matches=total_matches,
            next_page_available=(page * per_page) < total_matches,
            page_number=page,
            recommendations_per_page=per_page
        )

# Global instance
ai_matchmaking_service = AIMatchmakingService()
