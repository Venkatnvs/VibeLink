# VibeLinkUI - Technical Documentation Report

## Table of Contents
1. [Technologies and Software Used](#1-technologies-and-software-used)
2. [How Matching Algorithm Works](#2-how-matching-algorithm-works)
3. [How It Is Hosted on the Web](#3-how-it-is-hosted-on-the-web)
4. [List of APIs Used](#4-list-of-apis-used)
5. [How Email Authentication Works](#5-how-email-authentication-works)
6. [How Coordinates Are Fetched](#6-how-coordinates-are-fetched)
7. [How Chatting Works Between Users](#7-how-chatting-works-between-users)
8. [Where Images Are Stored and How](#8-where-images-are-stored-and-how)

---

## 1. Technologies and Software Used

### Frontend Technologies
- **React 19.1.1** - Modern JavaScript library for building user interfaces
- **TypeScript 5.8.3** - Typed superset of JavaScript for better development experience
- **Vite 7.1.2** - Fast build tool and development server
- **Tailwind CSS 4.1.12** - Utility-first CSS framework for styling
- **Redux Toolkit 2.8.2** - State management library for React applications
- **React Router DOM 7.8.2** - Client-side routing for React applications
- **Axios 1.11.0** - HTTP client for making API requests
- **Radix UI Components** - Accessible UI component library
- **Lucide React** - Icon library
- **React Hook Form** - Form handling library
- **Zod** - Schema validation library

### Backend Technologies
- **Django 5.2** - Python web framework
- **Django REST Framework** - Building REST APIs with Django
- **SQLite** - Lightweight database
- **JWT Authentication** - JSON Web Token for secure authentication
- **Gunicorn** - Python WSGI HTTP Server for production
- **WhiteNoise** - Static file serving for Django
- **Pillow** - Python imaging library for handling images
- **LangChain** - Framework for AI applications
- **Google Generative AI** - AI-powered matchmaking
- **Django CORS Headers** - Cross-Origin Resource Sharing support

### Development Tools
- **ESLint** - Code linting and quality assurance
- **TypeScript ESLint** - TypeScript-specific linting rules
- **Swagger/OpenAPI** - API documentation
- **Git** - Version control system

---

## 2. How Matching Algorithm Works

The VibeLink matching algorithm uses a sophisticated multi-factor approach to find compatible users:

### Core Matching Factors

1. **Age Compatibility (30% weight)**
   - Calculates compatibility based on age difference
   - Uses user's preferred age range settings
   - Closer ages get higher compatibility scores

2. **Location Compatibility (25% weight)**
   - Uses Haversine formula to calculate distance between users
   - Considers user's location radius preferences
   - Closer distances get higher scores

3. **Hashtag/Interest Compatibility (25% weight)**
   - Compares user hashtags and interests
   - Uses Jaccard similarity coefficient
   - More shared interests = higher compatibility

4. **Bio Compatibility (20% weight)**
   - Analyzes bio text similarity
   - Uses text analysis algorithms
   - Similar bio content increases compatibility

### AI-Enhanced Matching

The system also includes an AI-powered recommendation engine using Google's Gemini AI:

- **Profile Analysis**: AI analyzes user profiles comprehensively
- **Intelligent Recommendations**: Provides personalized match percentages
- **Conversation Starters**: Suggests conversation topics
- **Compatibility Reasons**: Explains why users are compatible
- **Fallback System**: Uses basic algorithm if AI fails

### Matching Process

1. **Filter Users**: Based on age range and location radius
2. **Calculate Scores**: For each compatibility factor
3. **Weighted Average**: Combine scores with predefined weights
4. **Sort Results**: By distance first, then by compatibility score
5. **AI Enhancement**: Optional AI analysis for better recommendations

---

## 3. How It Is Hosted on the Web

### Development Setup
- **Frontend**: Runs on Vite development server (typically port 5173)
- **Backend**: Django development server (typically port 8000)
- **Database**: SQLite file-based database

### Production Deployment
The application is configured for production deployment with:

- **WSGI Configuration**: `wsgi.py` file for WSGI servers like Gunicorn
- **ASGI Configuration**: `asgi.py` file for ASGI servers
- **Static Files**: WhiteNoise middleware for serving static files
- **Media Files**: Configured to serve user uploads
- **CORS Settings**: Configured for cross-origin requests

---

## 4. List of APIs Used

### Authentication APIs (`/api/auth/`)
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/token/refresh/` - Refresh JWT token
- `GET /api/auth/user/` - Get current user details
- `PUT /api/auth/user/update/` - Update user profile
- `POST /api/auth/verify-otp/` - Verify OTP
- `POST /api/auth/send-otp/` - Send OTP

### Social APIs (`/api/social/`)
- `GET /api/social/discover/` - Discover users
- `GET /api/social/follows/` - Get follow relationships
- `POST /api/social/follow/<user_id>/` - Follow/unfollow user
- `POST /api/social/follow-request/<user_id>/` - Send follow request
- `GET /api/social/follow-requests/` - Get follow requests
- `POST /api/social/follow-requests/<request_id>/accept/` - Accept follow request
- `POST /api/social/follow-requests/<request_id>/decline/` - Decline follow request
- `GET /api/social/followers/<user_id>/` - Get user's followers
- `GET /api/social/following/<user_id>/` - Get user's following
- `GET /api/social/user/<user_id>/` - Get user profile
- `GET /api/social/top-matches/` - Get top matches
- `GET /api/social/ai-recommendations/` - Get AI recommendations
- `GET /api/social/search/` - Search users

### Chat APIs (`/api/chat/`)
- `GET /api/chat/conversations/` - Get user's conversations
- `GET /api/chat/conversations/<id>/` - Get conversation details
- `GET /api/chat/conversations/<id>/messages/` - Get messages
- `POST /api/chat/conversations/<id>/messages/` - Send message
- `POST /api/chat/conversations/start/<user_id>/` - Start conversation
- `POST /api/chat/conversations/<id>/read/` - Mark messages as read

### Posts APIs (`/api/posts/`)
- `GET /api/posts/` - Get posts
- `POST /api/posts/` - Create post
- `GET /api/posts/<id>/` - Get post details
- `PUT /api/posts/<id>/` - Update post
- `DELETE /api/posts/<id>/` - Delete post

### Notifications APIs (`/api/notifications/`)
- `GET /api/notifications/` - Get notifications
- `POST /api/notifications/<id>/read/` - Mark notification as read
- `POST /api/notifications/read-all/` - Mark all notifications as read
- `DELETE /api/notifications/<id>/` - Delete notification
- `DELETE /api/notifications/delete-all/` - Delete all notifications

### Settings APIs (`/api/settings/`)
- `GET /api/settings/` - Get user settings
- `PUT /api/settings/` - Update user settings

### Utility APIs (`/api/utils/`)
- `GET /api/utils/states/` - Get states list
- `GET /api/utils/cities/<state>/` - Get cities for state
- `GET /api/utils/status/` - Get site status

### External APIs
- **Google Generative AI API** - For AI-powered matchmaking
- **Browser Geolocation API** - For getting user coordinates
- **Email SMTP** - For sending OTP emails

---

## 5. How Email Authentication Works

### Registration Process
1. **User Registration**: User provides email, username, password, and other details
2. **OTP Generation**: System generates a 6-digit random OTP
3. **OTP Hashing**: OTP is hashed using Django's password hashing
4. **Email Sending**: OTP is sent to user's email via SMTP
5. **OTP Storage**: Hashed OTP and metadata stored in database

### OTP Verification Process
1. **User Input**: User enters the 6-digit OTP
2. **Validation**: System checks if OTP is valid and not expired
3. **Attempt Tracking**: Tracks failed attempts (max 5 attempts)
4. **Account Activation**: Upon successful verification, user account is activated
5. **OTP Cleanup**: OTP is cleared from database after successful verification

### Security Features
- **OTP Expiration**: OTP expires after 10 minutes
- **Attempt Limiting**: Maximum 5 verification attempts
- **Resend Limiting**: Maximum 5 resend attempts with 60-second cooldown
- **Account Lockout**: Account locked after too many failed attempts
- **Email Threading**: Emails sent in separate threads to avoid blocking

### Email Configuration
- **SMTP Backend**: Uses Django's SMTP email backend
- **TLS Security**: Emails sent over TLS for security
- **Custom Templates**: HTML email templates for better user experience
- **Error Handling**: Graceful handling of email sending failures

---

## 6. How Coordinates Are Fetched

### Frontend Implementation
The application uses the browser's built-in Geolocation API to fetch user coordinates:

```javascript
navigator.geolocation.getCurrentPosition(
  (position) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        latitude: position.coords.latitude.toFixed(6),
        longitude: position.coords.longitude.toFixed(6)
      }
    }))
  },
  (error) => {
    console.error('Error getting location:', error)
    alert('Unable to get your location. Please enter coordinates manually.')
  }
)
```

### Process Flow
1. **Permission Request**: Browser asks user for location permission
2. **GPS/Network Location**: Uses GPS, WiFi, or cellular network to determine location
3. **Coordinate Extraction**: Extracts latitude and longitude with 6 decimal precision
4. **Data Storage**: Coordinates stored in user profile
5. **Fallback Option**: Manual coordinate entry if geolocation fails

### Backend Storage
- **Database Fields**: `latitude` and `longitude` stored as DecimalField
- **Precision**: 9 digits total, 6 decimal places (e.g., 37.774900)
- **Distance Calculation**: Uses Haversine formula for distance calculations
- **Location Matching**: Coordinates used for proximity-based matching

### Privacy and Security
- **User Consent**: Requires explicit user permission
- **Optional Feature**: Users can skip location sharing
- **Manual Entry**: Alternative manual coordinate entry available
- **Data Protection**: Coordinates stored securely in database

---

## 7. How Chatting Works Between Users

### Chat Architecture
The chat system uses a traditional request-response model with the following components:

### Database Models
1. **Conversation Model**
   - Links multiple users in a conversation
   - Tracks creation and update timestamps
   - Uses ManyToMany relationship for participants

2. **Message Model**
   - Stores individual messages
   - Links to conversation and sender
   - Tracks read status and timestamps

### Chat Flow Process
1. **Start Conversation**: User initiates chat with another user
2. **Conversation Creation**: System creates or finds existing conversation
3. **Message Sending**: Messages sent via POST request to API
4. **Message Storage**: Messages stored in database with metadata
5. **Message Retrieval**: Messages fetched with pagination
6. **Read Status**: Messages marked as read when viewed

### API Endpoints
- **Get Conversations**: Retrieve user's conversation list
- **Get Messages**: Fetch messages for a specific conversation
- **Send Message**: Create new message in conversation
- **Mark as Read**: Update message read status
- **Start Conversation**: Initiate new conversation with user

### Real-time Considerations
- **Polling**: Frontend polls for new messages (not real-time)
- **Pagination**: Messages loaded in pages for performance
- **Read Status**: Tracks which messages have been read
- **Message Ordering**: Messages ordered by creation time

### Security Features
- **Authentication**: All chat endpoints require user authentication
- **Authorization**: Users can only access their own conversations
- **Input Validation**: Message content validated before storage
- **Rate Limiting**: Potential for implementing rate limiting

---

## 8. Where Images Are Stored and How

### Image Storage System
The application uses Django's built-in file handling system for image storage:

### Storage Configuration
- **Media Root**: `MEDIA_ROOT = os.path.join(BASE_DIR, 'media')`
- **Media URL**: `MEDIA_URL = '/media/'`
- **Static Files**: Served by WhiteNoise middleware
- **File Upload**: Handled by Django's FileField and ImageField

### Image Types and Locations
1. **Profile Photos**
   - **Path**: `media/profile_photos/`
   - **Field**: `profile_photo` in User model
   - **Upload**: During registration or profile update

2. **Post Images**
   - **Path**: `media/posts/`
   - **Field**: `image` in Post model
   - **Upload**: When creating posts

### Image Processing
- **Pillow Library**: Python imaging library for image handling
- **Format Support**: Supports common image formats (JPEG, PNG, WebP)
- **Size Validation**: Django validates file sizes
- **Format Validation**: Ensures uploaded files are valid images

### File Upload Process
1. **Frontend Upload**: User selects image file
2. **Form Submission**: Image sent via multipart/form-data
3. **Backend Processing**: Django handles file upload
4. **Storage**: File saved to media directory
5. **Database Update**: File path stored in database
6. **URL Generation**: Django generates accessible URLs

### Security Features
- **File Validation**: Only image files allowed
- **Size Limits**: Prevents oversized file uploads
- **Path Security**: Prevents directory traversal attacks
- **Access Control**: Images served through Django's media handling

---

## Conclusion

VibeLinkUI is a comprehensive social networking application built with modern web technologies. It features an intelligent matching algorithm, secure authentication system, real-time chat capabilities, and robust image handling. The application is designed for scalability and can be easily deployed to various hosting platforms.

The system demonstrates best practices in web development, including proper authentication, data validation, security measures, and user experience considerations. The AI-enhanced matching algorithm provides users with intelligent recommendations, while the comprehensive API structure ensures smooth frontend-backend communication.

For production deployment, the application can be enhanced with additional features like real-time messaging via WebSockets, cloud-based image storage, and advanced caching mechanisms.
