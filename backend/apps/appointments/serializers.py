from rest_framework import serializers
from apps.users.serializers import UserSerializer
from apps.hospitals.serializers import HospitalSerializer
from apps.users.models import User
from apps.hospitals.models import Hospital
from .models import Appointment, PatientQueue

class AppointmentMinSerializer(serializers.ModelSerializer):
    patient = UserSerializer(read_only=True)
    doctor = UserSerializer(read_only=True)
    hospital = HospitalSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'hospital', 'patient', 'doctor', 
            'appointment_date', 'appointment_time', 'token_number', 
            'reason', 'status'
        ]

class PatientQueueSerializer(serializers.ModelSerializer):
    appointment = AppointmentMinSerializer(read_only=True)
    appointment_id = serializers.PrimaryKeyRelatedField(
        queryset=Appointment.objects.all(),
        source='appointment',
        write_only=True,
        required=False
    )

    class Meta:
        model = PatientQueue
        fields = [
            'id', 'appointment', 'appointment_id', 'queue_number', 'current_status', 
            'called_time', 'completed_time', 'created_at', 'updated_at'
        ]

class AppointmentSerializer(serializers.ModelSerializer):
    patient = UserSerializer(read_only=True)
    doctor = UserSerializer(read_only=True)
    hospital = HospitalSerializer(read_only=True)
    queue_entry = PatientQueueSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'hospital', 'patient', 'doctor', 
            'appointment_date', 'appointment_time', 'token_number', 
            'reason', 'status', 'created_by', 'created_at', 'updated_at',
            'queue_entry'
        ]

class AppointmentWriteSerializer(serializers.ModelSerializer):
    hospital_id = serializers.PrimaryKeyRelatedField(
        queryset=Hospital.objects.all(),
        source='hospital'
    )
    patient_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='patient'
    )
    doctor_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='doctor'
    )

    class Meta:
        model = Appointment
        fields = [
            'id', 'hospital_id', 'patient_id', 'doctor_id', 
            'appointment_date', 'appointment_time', 'token_number', 
            'reason', 'status'
        ]
        read_only_fields = ['id', 'token_number']
