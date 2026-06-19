from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from ..hospitals.models import Hospital
from ..hospitals.serializers import HospitalSerializer
from .models import User, Doctor, Patient


# ─── Doctor Profile Serializer ────────────────────────────────────────────────

class DoctorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = [
            'id', 'specialization', 'qualification', 'experience_years',
            'consultation_fee', 'available_days', 'available_time_start',
            'available_time_end', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# ─── Patient Profile Serializer ───────────────────────────────────────────────

class PatientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = [
            'id', 'patient_code', 'gender', 'date_of_birth', 'blood_group',
            'address', 'emergency_contact', 'allergies', 'medical_history',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'patient_code', 'created_at', 'updated_at']


# ─── User Serializers ─────────────────────────────────────────────────────────

class UserSerializer(serializers.ModelSerializer):
    hospital = HospitalSerializer(read_only=True)
    hospital_id = serializers.PrimaryKeyRelatedField(
        queryset=Hospital.objects.all(),
        source='hospital',
        write_only=True,
        required=False,
        allow_null=True
    )
    doctor_profile = DoctorProfileSerializer(read_only=True)
    patient_profile = PatientProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'hospital', 'hospital_id', 'full_name', 'email',
            'phone', 'role', 'is_active', 'is_profile_completed',
            'doctor_profile', 'patient_profile',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_profile_completed', 'created_at', 'updated_at']


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    hospital_id = serializers.PrimaryKeyRelatedField(
        queryset=Hospital.objects.all(),
        source='hospital',
        required=False,
        allow_null=True
    )

    class Meta:
        model = User
        fields = [
            'id', 'hospital_id', 'full_name', 'email',
            'phone', 'role', 'password', 'is_active'
        ]
        extra_kwargs = {
            'is_active': {'default': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        # Auto-create profile record for Doctor and Patient
        if user.role == 'DOCTOR':
            Doctor.objects.get_or_create(user=user, defaults={'hospital': user.hospital})
        elif user.role == 'PATIENT':
            # Generate patient code: PAT-XXXX
            count = Patient.objects.count() + 1
            patient_code = f"PAT-{count:04d}"
            Patient.objects.get_or_create(
                user=user,
                defaults={'hospital': user.hospital, 'patient_code': patient_code}
            )

        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    hospital_id = serializers.PrimaryKeyRelatedField(
        queryset=Hospital.objects.all(),
        source='hospital',
        required=False,
        allow_null=True
    )

    class Meta:
        model = User
        fields = [
            'id', 'hospital_id', 'full_name', 'email',
            'phone', 'role', 'password', 'is_active'
        ]

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance


# ─── JWT Token Serializer ─────────────────────────────────────────────────────

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = user.role
        token['full_name'] = user.full_name
        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        # Build doctor/patient profile data if available
        doctor_profile_data = None
        patient_profile_data = None
        try:
            if self.user.role == 'DOCTOR' and hasattr(self.user, 'doctor_profile'):
                doctor_profile_data = DoctorProfileSerializer(self.user.doctor_profile).data
        except Exception:
            pass
        try:
            if self.user.role == 'PATIENT' and hasattr(self.user, 'patient_profile'):
                patient_profile_data = PatientProfileSerializer(self.user.patient_profile).data
        except Exception:
            pass

        hospital_data = None
        if self.user.hospital:
            hospital_data = HospitalSerializer(self.user.hospital).data

        data['user'] = {
            'id': str(self.user.id),
            'email': self.user.email,
            'full_name': self.user.full_name,
            'role': self.user.role,
            'phone': self.user.phone,
            'is_active': self.user.is_active,
            'is_profile_completed': self.user.is_profile_completed,
            'hospital': hospital_data,
            'hospital_id': str(self.user.hospital.id) if self.user.hospital else None,
            'doctor_profile': doctor_profile_data,
            'patient_profile': patient_profile_data,
        }
        return data
