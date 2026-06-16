from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    login_view, HospitalViewSet, DoctorViewSet, PatientViewSet, AppointmentViewSet,
    InventoryItemViewSet, PrescriptionViewSet, BillViewSet, NotificationViewSet
)

router = DefaultRouter()
router.register(r'hospitals', HospitalViewSet)
router.register(r'doctors', DoctorViewSet)
router.register(r'patients', PatientViewSet)
router.register(r'appointments', AppointmentViewSet)
router.register(r'inventory', InventoryItemViewSet)
router.register(r'prescriptions', PrescriptionViewSet)
router.register(r'billing', BillViewSet)
router.register(r'notifications', NotificationViewSet)

urlpatterns = [
    path('auth/login/', login_view, name='login'),
    path('', include(router.urls)),
]
