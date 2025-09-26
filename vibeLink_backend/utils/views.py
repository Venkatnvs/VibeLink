from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import status, permissions
from rest_framework.response import Response
from django.core.cache import cache
import json
import os
from django.conf import settings
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

CACHE_TIMEOUT = 60 * 60 * 24

class StateCityView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    swagger_fake_view = True
    file_path = os.path.join(settings.BASE_DIR, 'datafiles', 'states_dist.json')

    def load_states_data(self):
        data = cache.get('states_data')
        states_dict = cache.get('states_dict')
        if data is None or states_dict is None:
            with open(self.file_path, 'r') as json_file:
                json_data = json.load(json_file)
                data = [item['state'] for item in json_data]
                states_dict = {item['state']: item for item in json_data}
            cache.set('states_data', data, CACHE_TIMEOUT)
            cache.set('states_dict', states_dict, CACHE_TIMEOUT)
        return data, states_dict

    def get(self, request):
        states_data, _ = self.load_states_data()
        return Response(states_data, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'state': openapi.Schema(type=openapi.TYPE_STRING, description='State name')
            },
            required=['state']
        ),
        operation_description="Get state info",
        responses={200: openapi.Response('State info', openapi.Schema(type=openapi.TYPE_OBJECT))}
    )
    def post(self, request):
        state = request.data.get('state')
        if not state:
            return Response({'error': 'State is required'}, status=status.HTTP_400_BAD_REQUEST)
        _, states_dict = self.load_states_data()
        state_info = states_dict.get(state)
        if state_info:
            return Response(state_info, status=status.HTTP_200_OK)
        return Response({'error': 'State not found'}, status=status.HTTP_404_NOT_FOUND)
    
    
class SiteStatusView(APIView):
    def get(self, request):
        return Response({'status': 'ok'}, status=status.HTTP_200_OK)