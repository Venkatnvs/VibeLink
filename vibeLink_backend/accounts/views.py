from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import (
    UserSerializer, 
    UserUpdateSerializer,
    RegisterSerializer, 
    CustomTokenObtainPairSerializer, 
    VerifyOTPSerializer,
    SendOTPSerializer
)
from rest_framework.exceptions import ValidationError
from .utils import send_otp_email

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except ValidationError as exc:
            return Response({"errors": exc.detail}, status=exc.status_code)
        self.perform_create(serializer)
        user = User.objects.get(email=serializer.data['email'])
        self.perform_otp_generation(user)
        headers = self.get_success_headers(serializer.data)
        
        # Return response with OTP sent confirmation
        response_data = {
            "data": serializer.data,
            "detail": "Registration successful. OTP sent to your email.",
            "otp_sent": True,
            "email": user.email
        }
        return Response(response_data, status=201, headers=headers)
    
    def perform_otp_generation(self, user):
        otp_raw = user.generate_otp()
        try:
            send_otp_email(user, otp_raw)
        except Exception:
            raise ValidationError({"detail": "Failed to send OTP email."})

class UserView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class UserUpdateView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserUpdateSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        try:
            serializer.is_valid(raise_exception=True)
        except ValidationError as exc:
            return Response({"errors": exc.detail}, status=exc.status_code)
        
        self.perform_update(serializer)
        
        # Return the updated user data with full URLs
        user_serializer = UserSerializer(instance, context={'request': request})
        return Response(user_serializer.data, status=status.HTTP_200_OK)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class VerifyOTPView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = VerifyOTPSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except ValidationError as exc:
            return Response({"errors": exc.detail}, status=exc.status_code)
        responce_data = {
            "data": serializer.data,
            "detail": "OTP verified successfully."
        }
        return Response(responce_data, status=status.HTTP_200_OK)
        
class SendOTPView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = SendOTPSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except ValidationError as exc:
            return Response({"errors": exc.detail}, status=exc.status_code)
        user = serializer.validated_data.get('user')
        otp_raw = user.generate_otp()
        try:
            send_otp_email(user, otp_raw)
        except Exception:
            raise ValidationError({"detail": "Failed to send OTP email."})
        responce_data = {
            "data": {
                "email": user.email,
                "resend_otp": "Available after 60 seconds.",
                "resend_attempts_left": 4 - int(user.otp_metadata.split(':')[2]) if user.otp_metadata else 0
            },
            "detail": "OTP resent successfully."
        }
        return Response(responce_data, status=status.HTTP_200_OK)