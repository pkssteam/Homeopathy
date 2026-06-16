from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from ..hospitals.models import Hospital
from ..hospitals.serializers import HospitalSerializer
from .models import User

class UserSerializer(serializers.ModelSerializer):
    hospital = HospitalSerializer(read_only=True)
    hospital_id = serializers.PrimaryKeyRelatedField(
        queryset=Hospital.objects.all(),
        source='hospital',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = User
        fields = [
            'id', 'hospital', 'hospital_id', 'full_name', 'email', 
            'phone', 'role', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

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
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
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
        data['user'] = {
            'id': str(self.user.id),
            'email': self.user.email,
            'full_name': self.user.full_name,
            'role': self.user.role,
            'phone': self.user.phone,
            'hospital_id': str(self.user.hospital.id) if self.user.hospital else None,
        }
        return data
