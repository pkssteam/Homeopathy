from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, Doctor, Patient
from .serializers import (
    UserSerializer, UserRegisterSerializer, UserUpdateSerializer,
    CustomTokenObtainPairSerializer, DoctorProfileSerializer, PatientProfileSerializer
)
from core.permissions.permissions import IsAdminRole


# ─── JWT Login ────────────────────────────────────────────────────────────────

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


# ─── User Management (Admin) ──────────────────────────────────────────────────

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegisterSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer

    def get_queryset(self):
        queryset = User.objects.all().order_by('-created_at')
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
        return queryset

    def get_permissions(self):
        if self.action in ['me', 'change_password']:
            return [permissions.IsAuthenticated()]
        return [IsAdminRole()]

    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        if request.method in ['PUT', 'PATCH']:
            serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')

        if not current_password or not new_password:
            return Response({'error': 'Please provide both current and new password.'}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(current_password):
            return Response({'error': 'Incorrect current password.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({'status': 'password_changed', 'message': 'Password updated successfully.'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response({'status': 'activated', 'user': UserSerializer(user).data}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({'status': 'deactivated', 'user': UserSerializer(user).data}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['delete'])
    def delete_all(self, request):
        role = request.query_params.get('role')
        queryset = self.get_queryset()
        if role:
            queryset = queryset.filter(role=role)
        queryset = queryset.exclude(role='ADMIN').exclude(is_superuser=True).exclude(id=request.user.id)
        count = queryset.count()
        queryset.delete()
        return Response({'message': f'Successfully deleted {count} entries.'}, status=status.HTTP_204_NO_CONTENT)


# ─── Doctor Profile ViewSet ───────────────────────────────────────────────────

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.select_related('user', 'hospital').all()
    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['me', 'complete_profile']:
            return [permissions.IsAuthenticated()]
        return [IsAdminRole()]

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get the logged-in doctor's profile."""
        if request.user.role != 'DOCTOR':
            return Response({'error': 'Not a doctor account.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            profile = request.user.doctor_profile
            return Response(DoctorProfileSerializer(profile).data, status=status.HTTP_200_OK)
        except Doctor.DoesNotExist:
            return Response({'error': 'Doctor profile not found.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def complete_profile(self, request):
        """Doctor fills in their professional profile for the first time."""
        if request.user.role != 'DOCTOR':
            return Response({'error': 'Not a doctor account.'}, status=status.HTTP_403_FORBIDDEN)

        # Ensure profile record exists
        doctor, _ = Doctor.objects.get_or_create(
            user=request.user,
            defaults={'hospital': request.user.hospital}
        )

        serializer = DoctorProfileSerializer(doctor, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            # Mark user profile as completed
            request.user.is_profile_completed = True
            request.user.save(update_fields=['is_profile_completed'])
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def set_fee(self, request, pk=None):
        """Admin sets consultation fee for a doctor."""
        doctor = self.get_object()
        fee = request.data.get('consultation_fee')
        if fee is None:
            return Response({'error': 'consultation_fee is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            fee = float(fee)
            if fee < 0:
                raise ValueError()
        except (ValueError, TypeError):
            return Response({'error': 'Invalid fee value.'}, status=status.HTTP_400_BAD_REQUEST)

        doctor.consultation_fee = fee
        doctor.save(update_fields=['consultation_fee'])
        return Response(DoctorProfileSerializer(doctor).data, status=status.HTTP_200_OK)


# ─── Patient Profile ViewSet ──────────────────────────────────────────────────

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.select_related('user', 'hospital').all()
    serializer_class = PatientProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['me', 'complete_profile']:
            return [permissions.IsAuthenticated()]
        return [IsAdminRole()]

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get the logged-in patient's profile."""
        if request.user.role != 'PATIENT':
            return Response({'error': 'Not a patient account.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            profile = request.user.patient_profile
            return Response(PatientProfileSerializer(profile).data, status=status.HTTP_200_OK)
        except Patient.DoesNotExist:
            return Response({'error': 'Patient profile not found.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def complete_profile(self, request):
        """Patient fills in their clinical profile for the first time."""
        if request.user.role != 'PATIENT':
            return Response({'error': 'Not a patient account.'}, status=status.HTTP_403_FORBIDDEN)

        # Ensure profile record exists
        count = Patient.objects.count() + 1
        patient_code = f"PAT-{count:04d}"
        patient, created = Patient.objects.get_or_create(
            user=request.user,
            defaults={'hospital': request.user.hospital, 'patient_code': patient_code}
        )

        serializer = PatientProfileSerializer(patient, data=request.data, partial=True)
        if serializer.is_valid():
            saved = serializer.save()
            # Mark user profile as completed
            request.user.is_profile_completed = True
            request.user.save(update_fields=['is_profile_completed'])
            return Response(PatientProfileSerializer(saved).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
