from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from django.utils import timezone

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    profile_photo = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = (
            'id', 'email', 'username', 'full_name', 'first_name', 'last_name', 
            'age', 'profile_photo', 'bio', 'city', 'state', 'latitude', 'longitude',
            'hashtags', 'is_active', 'is_staff', 'is_superuser', 'is_otp_verified', 
            'is_completed', 'date_joined', 'last_login', 'followers_count', 'following_count'
        )

    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_profile_photo(self, obj):
        if obj.profile_photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_photo.url)
            return obj.profile_photo.url
        return None
    
    def get_followers_count(self, obj):
        return obj.followers.count()
    
    def get_following_count(self, obj):
        return obj.following.count()

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'first_name', 'last_name', 'age', 'profile_photo', 'bio', 
            'city', 'state', 'latitude', 'longitude', 'hashtags'
        )
        extra_kwargs = {
            'profile_photo': {'required': False},
            'hashtags': {'required': False}
        }

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    profile_photo = serializers.ImageField(required=False, write_only=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    hashtags = serializers.ListField(child=serializers.CharField(), required=True)

    class Meta:
        model = User
        fields = (
            'id', 'first_name', 'last_name', 'username', 'email', 'password', 
            'confirm_password', 'age', 'profile_photo', 'city', 'state', 
            'latitude', 'longitude', 'bio', 'hashtags'
        )

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email is already in use.")
        try:
            validate_email(value)
            return value
        except DjangoValidationError:
            raise serializers.ValidationError("Enter a valid email address.")
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username is already taken.")
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        
        if len(attrs['hashtags']) < 10:
            raise serializers.ValidationError("Please select at least 10 hashtags.")
        
        return attrs

    def create(self, validated_data):
        # Remove fields that don't exist in the model
        validated_data.pop('confirm_password')
        profile_photo = validated_data.pop('profile_photo', None)
        hashtags = validated_data.pop('hashtags')
        
        # Create user with basic fields
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            age=validated_data['age'],
            bio=validated_data['bio'],
            city=validated_data['city'],
            state=validated_data['state'],
            latitude=validated_data['latitude'],
            longitude=validated_data['longitude'],
            hashtags=hashtags,
            is_completed=True,
            is_active=True
        )
        
        # Handle profile photo
        if profile_photo:
            user.profile_photo = profile_photo
            user.save()
        
        return user

class CustomTokenObtainPairSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(request=self.context.get('request'), email=email, password=password)

            if not user:
                raise serializers.ValidationError('Invalid credentials')
            
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            
            if not user.is_otp_verified:
                raise serializers.ValidationError('User account is not verified.')
            
            user.last_login = timezone.now()
            user.save()
            
            refresh = RefreshToken.for_user(user)
            return {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'is_active': user.is_active,
                'is_otp_verified': user.is_otp_verified,
                'is_completed': user.is_completed,
                'full_name': user.get_full_name(),
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }
        else:
            raise serializers.ValidationError('Must include "email" and "password".')

class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        otp = attrs.get('otp')
        if not email or not otp:
            raise serializers.ValidationError("Email and OTP are required.")
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email.")
        if user.is_otp_verified:
            raise serializers.ValidationError("User account is already verified.")
        if not user.otp_metadata:
            raise serializers.ValidationError("No OTP request found. Please request a new OTP.")
        # Check if OTP is Expired
        created_at, _, _ = user.otp_metadata.split(':')
        created_at = float(created_at)
        if timezone.now().timestamp() > created_at + 600:
            raise serializers.ValidationError("OTP has expired. Please request a new OTP.")
        # Check if OTP is Valid
        if user.is_otp_valid(otp):
            user.is_otp_verified = True
            user.save()
            attrs['user'] = user
            return attrs
        else:
            attempts_left = 5 - int(user.otp_metadata.split(':')[1]) if user.otp_metadata else 5
            responce_message = f"Invalid or expired OTP. You have {attempts_left} attempts left."
            if attempts_left == 0:
                responce_message = "You have exceeded the maximum number of attempts. Please request a new OTP."
            raise serializers.ValidationError(responce_message)
        
class SendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate(self, attrs):
        email = attrs.get('email')
        if not email:
            raise serializers.ValidationError("Email is required.")
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email.")
        if user.is_otp_verified:
            raise serializers.ValidationError("User account is already verified.")
        if not user.can_resend_otp():
            if user.otp_metadata:
                created_at, _, _ = user.otp_metadata.split(':')
                created_at = float(created_at)
            else:
                created_at = timezone.now().timestamp()
            time_passed = timezone.now().timestamp() - created_at
            time_left = int(max(60 - time_passed, 0))
            raise serializers.ValidationError(f"You can only request a new OTP after {time_left} seconds.")
        attrs['user'] = user
        return attrs