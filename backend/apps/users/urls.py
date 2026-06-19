from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import CustomTokenObtainPairView, UserViewSet, DoctorViewSet, PatientViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='users')
router.register(r'doctors', DoctorViewSet, basename='doctors')
router.register(r'patients', PatientViewSet, basename='patients')

urlpatterns = [
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
]
