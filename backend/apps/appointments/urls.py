from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AppointmentViewSet, PatientQueueViewSet

router = DefaultRouter()
router.register(r'appointments', AppointmentViewSet, basename='appointments')
router.register(r'queue', PatientQueueViewSet, basename='queue')

urlpatterns = [
    path('', include(router.urls)),
]
