export const APP_NAME = "VibeLink";
export const APP_DESCRIPTION = "Connect with friends, find meaningful friendships, and discover new connections";

// Navigation items
export const NAV_ITEMS = [
  { name: "Home", href: "/", icon: "Home" },
  { name: "Discover", href: "/discover", icon: "Compass" },
  { name: "Chat", href: "/chat", icon: "MessageCircle" },
  { name: "Notifications", href: "/notifications", icon: "Bell" },
  { name: "Profile", href: "/profile", icon: "User" },
  { name: "Settings", href: "/settings", icon: "Settings" },
];

// Friendship-based hashtags (80+ options)
export const FRIENDSHIP_HASHTAGS = [
  // Hobbies & Interests
  { name: "reading", count: 15420, category: "hobbies" },
  { name: "photography", count: 12340, category: "hobbies" },
  { name: "travel", count: 9876, category: "hobbies" },
  { name: "cooking", count: 8765, category: "hobbies" },
  { name: "fitness", count: 7654, category: "hobbies" },
  { name: "art", count: 6543, category: "hobbies" },
  { name: "music", count: 5432, category: "hobbies" },
  { name: "gaming", count: 4321, category: "hobbies" },
  { name: "dancing", count: 3456, category: "hobbies" },
  { name: "painting", count: 2345, category: "hobbies" },
  { name: "writing", count: 1987, category: "hobbies" },
  { name: "gardening", count: 1876, category: "hobbies" },
  { name: "hiking", count: 1765, category: "hobbies" },
  { name: "swimming", count: 1654, category: "hobbies" },
  { name: "cycling", count: 1543, category: "hobbies" },
  { name: "yoga", count: 1432, category: "hobbies" },
  { name: "meditation", count: 1321, category: "hobbies" },
  { name: "knitting", count: 1210, category: "hobbies" },
  { name: "pottery", count: 1199, category: "hobbies" },
  { name: "calligraphy", count: 1188, category: "hobbies" },

  // Lifestyle & Values
  { name: "mindfulness", count: 3456, category: "lifestyle" },
  { name: "sustainability", count: 2345, category: "lifestyle" },
  { name: "minimalism", count: 2234, category: "lifestyle" },
  { name: "vegan", count: 2123, category: "lifestyle" },
  { name: "vegetarian", count: 2012, category: "lifestyle" },
  { name: "glutenfree", count: 1901, category: "lifestyle" },
  { name: "organic", count: 1790, category: "lifestyle" },
  { name: "zerowaste", count: 1679, category: "lifestyle" },
  { name: "slowliving", count: 1568, category: "lifestyle" },
  { name: "digitaldetox", count: 1457, category: "lifestyle" },
  { name: "earlybird", count: 1346, category: "lifestyle" },
  { name: "nightowl", count: 1235, category: "lifestyle" },
  { name: "introvert", count: 1124, category: "lifestyle" },
  { name: "extrovert", count: 1013, category: "lifestyle" },
  { name: "ambivert", count: 902, category: "lifestyle" },

  // Career & Education
  { name: "tech", count: 8765, category: "career" },
  { name: "entrepreneur", count: 7654, category: "career" },
  { name: "freelancer", count: 6543, category: "career" },
  { name: "student", count: 5432, category: "career" },
  { name: "teacher", count: 4321, category: "career" },
  { name: "doctor", count: 3210, category: "career" },
  { name: "engineer", count: 3099, category: "career" },
  { name: "designer", count: 2988, category: "career" },
  { name: "writer", count: 2877, category: "career" },
  { name: "artist", count: 2766, category: "career" },
  { name: "musician", count: 2655, category: "career" },
  { name: "chef", count: 2544, category: "career" },
  { name: "nurse", count: 2433, category: "career" },
  { name: "lawyer", count: 2322, category: "career" },
  { name: "accountant", count: 2211, category: "career" },
  { name: "marketing", count: 2100, category: "career" },
  { name: "sales", count: 1989, category: "career" },
  { name: "hr", count: 1878, category: "career" },
  { name: "finance", count: 1767, category: "career" },

  // Social & Relationships
  { name: "single", count: 5678, category: "social" },
  { name: "married", count: 4567, category: "social" },
  { name: "parent", count: 3456, category: "social" },
  { name: "petlover", count: 2345, category: "social" },
  { name: "dogperson", count: 2234, category: "social" },
  { name: "catperson", count: 2123, category: "social" },
  { name: "familyoriented", count: 2012, category: "social" },
  { name: "friendfocused", count: 1901, category: "social" },
  { name: "community", count: 1790, category: "social" },
  { name: "volunteer", count: 1679, category: "social" },
  { name: "mentor", count: 1568, category: "social" },
  { name: "mentee", count: 1457, category: "social" },
  { name: "networking", count: 1346, category: "social" },
  { name: "collaboration", count: 1235, category: "social" },
  { name: "teamplayer", count: 1124, category: "social" },
  { name: "leader", count: 1013, category: "social" },
  { name: "follower", count: 902, category: "social" },

  // Culture & Background
  { name: "multicultural", count: 3456, category: "culture" },
  { name: "bilingual", count: 2345, category: "culture" },
  { name: "expat", count: 2234, category: "culture" },
  { name: "immigrant", count: 2123, category: "culture" },
  { name: "local", count: 2012, category: "culture" },
  { name: "globalcitizen", count: 1901, category: "culture" },
  { name: "traditional", count: 1790, category: "culture" },
  { name: "modern", count: 1679, category: "culture" },
  { name: "spiritual", count: 1568, category: "culture" },
  { name: "religious", count: 1457, category: "culture" },
  { name: "agnostic", count: 1346, category: "culture" },
  { name: "atheist", count: 1235, category: "culture" },
  { name: "philosophy", count: 1124, category: "culture" },
  { name: "history", count: 1013, category: "culture" },
  { name: "politics", count: 902, category: "culture" },
  { name: "activism", count: 891, category: "culture" },
  { name: "environmentalist", count: 780, category: "culture" },
  { name: "feminist", count: 669, category: "culture" },
  { name: "lgbtq", count: 558, category: "culture" },
  { name: "ally", count: 447, category: "culture" },

  // Health & Wellness
  { name: "mentalhealth", count: 4567, category: "health" },
  { name: "selfcare", count: 3456, category: "health" },
  { name: "therapy", count: 2345, category: "health" },
  { name: "anxiety", count: 2234, category: "health" },
  { name: "depression", count: 2123, category: "health" },
  { name: "recovery", count: 2012, category: "health" },
  { name: "sober", count: 1901, category: "health" },
  { name: "addiction", count: 1790, category: "health" },
  { name: "disability", count: 1679, category: "health" },
  { name: "chronicillness", count: 1568, category: "health" },
  { name: "cancer", count: 1457, category: "health" },
  { name: "diabetes", count: 1346, category: "health" },
  { name: "autism", count: 1235, category: "health" },
  { name: "adhd", count: 1124, category: "health" },
  { name: "ptsd", count: 1013, category: "health" },
  { name: "ocd", count: 902, category: "health" },
  { name: "bipolar", count: 891, category: "health" },
  { name: "schizophrenia", count: 780, category: "health" },
  { name: "eatingdisorder", count: 669, category: "health" },
  { name: "bodypositivity", count: 558, category: "health" },
  { name: "bodyneutrality", count: 447, category: "health" }
];

// Sample users with location data for matchmaking
export const SAMPLE_USERS = [
  {
    id: "1",
    name: "Alex Johnson",
    username: "@alexj",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    bio: "Digital nomad and coffee enthusiast ☕ Looking for meaningful friendships and travel buddies",
    followers: 1247,
    following: 892,
    posts: 156,
    isOnline: true,
    lastSeen: "2 minutes ago",
    location: {
      city: "San Francisco",
      state: "CA",
      country: "USA",
      coordinates: { lat: 37.7749, lng: -122.4194 },
      radius: 50 // km
    },
    hashtags: ["travel", "coffee", "digitalnomad", "photography", "mindfulness"],
    interests: ["hiking", "reading", "cooking", "yoga", "meditation"],
    pictures: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop"
    ]
  },
  {
    id: "2",
    name: "Sarah Chen",
    username: "@sarahchen",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    bio: "Artist and nature lover 🌿 Passionate about sustainability and creative expression",
    followers: 2156,
    following: 567,
    posts: 89,
    isOnline: false,
    lastSeen: "1 hour ago",
    location: {
      city: "Portland",
      state: "OR",
      country: "USA",
      coordinates: { lat: 45.5152, lng: -122.6784 },
      radius: 30
    },
    hashtags: ["art", "sustainability", "nature", "vegan", "mindfulness"],
    interests: ["painting", "gardening", "hiking", "meditation", "cooking"],
    pictures: [
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop"
    ]
  },
  {
    id: "3",
    name: "Mike Rodriguez",
    username: "@mikerod",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    bio: "Tech enthusiast and gamer 🎮 Building the future one line of code at a time",
    followers: 892,
    following: 445,
    posts: 234,
    isOnline: true,
    lastSeen: "5 minutes ago",
    location: {
      city: "Austin",
      state: "TX",
      country: "USA",
      coordinates: { lat: 30.2672, lng: -97.7431 },
      radius: 40
    },
    hashtags: ["tech", "gaming", "coding", "entrepreneur", "innovation"],
    interests: ["programming", "gaming", "reading", "fitness", "music"],
    pictures: [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
    ]
  },
  {
    id: "4",
    name: "Emma Wilson",
    username: "@emmaw",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    bio: "Bookworm and travel blogger 📚✈️ Exploring the world one story at a time",
    followers: 3456,
    following: 1234,
    posts: 445,
    isOnline: false,
    lastSeen: "3 hours ago",
    location: {
      city: "Seattle",
      state: "WA",
      country: "USA",
      coordinates: { lat: 47.6062, lng: -122.3321 },
      radius: 35
    },
    hashtags: ["reading", "travel", "writing", "blogging", "adventure"],
    interests: ["books", "writing", "photography", "hiking", "coffee"],
    pictures: [
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
    ]
  },
  {
    id: "5",
    name: "David Kim",
    username: "@davidkim",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    bio: "Photographer and adventure seeker 📸 Capturing life's beautiful moments",
    followers: 5678,
    following: 2345,
    posts: 678,
    isOnline: true,
    lastSeen: "1 minute ago",
    location: {
      city: "Denver",
      state: "CO",
      country: "USA",
      coordinates: { lat: 39.7392, lng: -104.9903 },
      radius: 60
    },
    hashtags: ["photography", "adventure", "outdoors", "travel", "nature"],
    interests: ["photography", "hiking", "climbing", "skiing", "camping"],
    pictures: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop"
    ]
  },
  {
    id: "6",
    name: "Lisa Thompson",
    username: "@lisathompson",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    bio: "Yoga instructor and wellness coach 🧘‍♀️ Helping others find balance and inner peace",
    followers: 3456,
    following: 1234,
    posts: 234,
    isOnline: false,
    lastSeen: "30 minutes ago",
    location: {
      city: "Boulder",
      state: "CO",
      country: "USA",
      coordinates: { lat: 40.0150, lng: -105.2705 },
      radius: 25
    },
    hashtags: ["yoga", "wellness", "mindfulness", "meditation", "selfcare"],
    interests: ["yoga", "meditation", "healthy cooking", "hiking", "reading"],
    pictures: [
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
    ]
  },
  {
    id: "7",
    name: "James Wilson",
    username: "@jameswilson",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    bio: "Chef and food blogger 👨‍🍳 Sharing the joy of cooking and exploring new cuisines",
    followers: 4567,
    following: 1890,
    posts: 567,
    isOnline: true,
    lastSeen: "5 minutes ago",
    location: {
      city: "New Orleans",
      state: "LA",
      country: "USA",
      coordinates: { lat: 29.9511, lng: -90.0715 },
      radius: 40
    },
    hashtags: ["cooking", "food", "culinary", "travel", "culture"],
    interests: ["cooking", "food photography", "travel", "music", "history"],
    pictures: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
    ]
  },
  {
    id: "8",
    name: "Maria Garcia",
    username: "@mariagarcia",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
    bio: "Environmental scientist and climate activist 🌍 Working towards a sustainable future",
    followers: 6789,
    following: 2345,
    posts: 345,
    isOnline: false,
    lastSeen: "2 hours ago",
    location: {
      city: "Seattle",
      state: "WA",
      country: "USA",
      coordinates: { lat: 47.6062, lng: -122.3321 },
      radius: 35
    },
    hashtags: ["environment", "sustainability", "climate", "science", "activism"],
    interests: ["environmental science", "hiking", "photography", "reading", "volunteering"],
    pictures: [
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
    ]
  }
];

// Sample posts (simplified - only like and share)
export const SAMPLE_POSTS = [
  {
    id: "1",
    userId: "1",
    user: SAMPLE_USERS[0],
    content: "Just finished a great hike! The views were absolutely breathtaking. Nature always has a way of putting things into perspective. 🏔️ #hiking #nature #perspective",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    likes: 89,
    shares: 5,
    timestamp: "2 hours ago",
    hashtags: ["hiking", "nature", "perspective"]
  },
  {
    id: "2",
    userId: "2",
    user: SAMPLE_USERS[1],
    content: "Working on a new painting today. Sometimes the best inspiration comes from unexpected places. What's inspiring you today? 🎨 #art #inspiration #creativity",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop",
    likes: 156,
    shares: 8,
    timestamp: "4 hours ago",
    hashtags: ["art", "inspiration", "creativity"]
  },
  {
    id: "3",
    userId: "3",
    user: SAMPLE_USERS[2],
    content: "Finally got that new gaming setup! The graphics are insane. Anyone up for some multiplayer action tonight? 🎮 #gaming #setup #multiplayer",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop",
    likes: 234,
    shares: 12,
    timestamp: "6 hours ago",
    hashtags: ["gaming", "setup", "multiplayer"]
  },
  {
    id: "4",
    userId: "4",
    user: SAMPLE_USERS[3],
    content: "Reading this amazing book about mindfulness. Highly recommend for anyone looking to find more peace in their daily life. 📖 #mindfulness #reading #peace",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop",
    likes: 78,
    shares: 3,
    timestamp: "8 hours ago",
    hashtags: ["mindfulness", "reading", "peace"]
  },
  {
    id: "5",
    userId: "5",
    user: SAMPLE_USERS[4],
    content: "Captured this stunning sunset during my evening walk. Photography has taught me to see beauty in every moment. 🌅 #photography #sunset #beauty",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    likes: 345,
    shares: 18,
    timestamp: "1 day ago",
    hashtags: ["photography", "sunset", "beauty"]
  }
];

// Sample chat messages (simplified - only text)
export const SAMPLE_CHATS = [
  {
    id: "1",
    user: SAMPLE_USERS[0],
    lastMessage: "Hey! How's your day going?",
    timestamp: "2 minutes ago",
    unreadCount: 0
  },
  {
    id: "2",
    user: SAMPLE_USERS[1],
    lastMessage: "Thanks for the book recommendation!",
    timestamp: "1 hour ago",
    unreadCount: 1
  },
  {
    id: "3",
    user: SAMPLE_USERS[2],
    lastMessage: "Game night this weekend?",
    timestamp: "3 hours ago",
    unreadCount: 0
  },
  {
    id: "4",
    user: SAMPLE_USERS[3],
    lastMessage: "Love your travel photos!",
    timestamp: "1 day ago",
    unreadCount: 2
  },
  {
    id: "5",
    user: SAMPLE_USERS[4],
    lastMessage: "Great shot from today!",
    timestamp: "2 days ago",
    unreadCount: 0
  }
];

// Sample notifications
export const SAMPLE_NOTIFICATIONS = [
  {
    id: "1",
    type: "like",
    user: SAMPLE_USERS[0],
    content: "liked your post",
    timestamp: "2 minutes ago",
    isRead: false
  },
  {
    id: "2",
    type: "share",
    user: SAMPLE_USERS[1],
    content: "shared your post",
    timestamp: "1 hour ago",
    isRead: false
  },
  {
    id: "3",
    type: "match",
    user: SAMPLE_USERS[2],
    content: "You have a 85% match!",
    timestamp: "3 hours ago",
    isRead: true
  },
  {
    id: "4",
    type: "message",
    user: SAMPLE_USERS[3],
    content: "sent you a message",
    timestamp: "1 day ago",
    isRead: true
  }
];

// Sample settings
export const SAMPLE_SETTINGS = {
  notifications: {
    likes: true,
    shares: true,
    matches: true,
    messages: true
  },
  privacy: {
    profileVisibility: "public",
    showLocation: true,
    allowMessages: "friends",
    showOnlineStatus: false
  },
  matchmaking: {
    locationRadius: 50, // km
    ageRange: { min: 18, max: 65 },
    showDistance: true
  },
  appearance: {
    theme: "light",
    fontSize: "medium",
    compactMode: false
  }
};

// Match compatibility calculation function
export const calculateMatchPercentage = (user1: any, user2: any) => {
  let score = 0;
  let total = 0;

  // Hashtag compatibility (40% weight)
  const commonHashtags = user1.hashtags.filter((tag: string) => 
    user2.hashtags.includes(tag)
  );
  const hashtagScore = (commonHashtags.length / Math.max(user1.hashtags.length, user2.hashtags.length)) * 40;
  score += hashtagScore;
  total += 40;

  // Interest compatibility (30% weight)
  const commonInterests = user1.interests.filter((interest: string) => 
    user2.interests.includes(interest)
  );
  const interestScore = (commonInterests.length / Math.max(user1.interests.length, user2.interests.length)) * 30;
  score += interestScore;
  total += 30;

  // Location compatibility (20% weight)
  const distance = calculateDistance(user1.location.coordinates, user2.location.coordinates);
  const maxDistance = Math.max(user1.location.radius, user2.location.radius);
  const locationScore = Math.max(0, (1 - distance / maxDistance)) * 20;
  score += locationScore;
  total += 20;

  // Bio compatibility (10% weight)
  const bioWords1 = user1.bio.toLowerCase().split(' ');
  const bioWords2 = user2.bio.toLowerCase().split(' ');
  const commonWords = bioWords1.filter((word: string) => bioWords2.includes(word));
  const bioScore = (commonWords.length / Math.max(bioWords1.length, bioWords2.length)) * 10;
  score += bioScore;
  total += 10;

  return Math.round((score / total) * 100);
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (coord1: any, coord2: any) => {
  const R = 6371; // Earth's radius in km
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
