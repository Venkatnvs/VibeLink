from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, 
    UserView, 
    UserUpdateView,
    CustomTokenObtainPairView,
    VerifyOTPView,
    SendOTPView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='accounts-register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='accounts-token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='accounts-token_refresh'),
    path('user/', UserView.as_view(), name='accounts-user_detail'),
    path('user/update/', UserUpdateView.as_view(), name='accounts-user_update'),

    path('verify-otp/', VerifyOTPView.as_view(), name='accounts-verify_otp'),
    path('send-otp/', SendOTPView.as_view(), name='accounts-resend_otp'),
]