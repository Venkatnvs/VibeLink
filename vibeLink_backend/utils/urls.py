from django.urls import path
from .views import StateCityView

urlpatterns = [
    path('states-cities/', StateCityView.as_view(), name='utils-states'),
]