from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import UserSettings
from .serializers import UserSettingsSerializer, UserSettingsUpdateSerializer

User = get_user_model()

class UserSettingsView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSettingsSerializer

    def get_object(self):
        settings, created = UserSettings.objects.get_or_create(user=self.request.user)
        return settings

    def get_serializer_class(self):
        if self.request.method == 'PATCH':
            return UserSettingsUpdateSerializer
        return UserSettingsSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Return the full settings
        full_serializer = UserSettingsSerializer(instance)
        return Response(full_serializer.data, status=status.HTTP_200_OK)
