from rest_framework import serializers
from .models import Consultation, ConsultationPrescription, ConsultationReport, ConsultationFollowUp
from apps.appointments.models import Appointment
from apps.inventory.models import InventoryItem
from apps.users.serializers import UserSerializer

class ConsultationPrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsultationPrescription
        fields = ['id', 'medicine_name', 'inventory_item', 'dosage', 'duration', 'instructions', 'status', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']

class ConsultationReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsultationReport
        fields = ['id', 'report_name', 'report_file', 'created_at']
        read_only_fields = ['id', 'created_at']

class ConsultationFollowUpSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsultationFollowUp
        fields = ['id', 'next_visit_date', 'follow_up_notes', 'future_appointment', 'created_at']
        read_only_fields = ['id', 'future_appointment', 'created_at']

class AppointmentMinimalSerializer(serializers.ModelSerializer):
    booked_by_name = serializers.CharField(source='created_by.full_name', read_only=True, default='')
    booked_by_role = serializers.CharField(source='created_by.role', read_only=True, default='')

    class Meta:
        model = Appointment
        fields = ['id', 'appointment_date', 'appointment_time', 'status', 'booked_by_name', 'booked_by_role', 'created_at']

class ConsultationSerializer(serializers.ModelSerializer):
    patient_detail = UserSerializer(source='patient', read_only=True)
    doctor_detail = UserSerializer(source='doctor', read_only=True)
    appointment_detail = AppointmentMinimalSerializer(source='appointment', read_only=True)
    prescriptions = ConsultationPrescriptionSerializer(many=True, required=False)
    reports = ConsultationReportSerializer(many=True, required=False)
    follow_up = ConsultationFollowUpSerializer(required=False)

    class Meta:
        model = Consultation
        fields = [
            'id', 'appointment', 'patient', 'doctor', 'patient_detail', 'doctor_detail', 'appointment_detail',
            'chief_complaint', 'symptoms', 'diagnosis_notes', 'consultation_notes', 'disease_stage',
            'prescriptions', 'reports', 'follow_up', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'patient', 'doctor', 'created_at', 'updated_at']

    def create(self, validated_data):
        prescriptions_data = validated_data.pop('prescriptions', [])
        follow_up_data = validated_data.pop('follow_up', None)
        
        # Get patient, doctor and hospital from the appointment
        appointment = validated_data.get('appointment')
        
        # Check if a consultation already exists for this appointment
        existing_consultation = Consultation.objects.filter(appointment=appointment).first()
        
        if existing_consultation:
            # Update the existing consultation
            existing_consultation.chief_complaint = validated_data.get('chief_complaint', existing_consultation.chief_complaint)
            existing_consultation.symptoms = validated_data.get('symptoms', existing_consultation.symptoms)
            existing_consultation.diagnosis_notes = validated_data.get('diagnosis_notes', existing_consultation.diagnosis_notes)
            existing_consultation.consultation_notes = validated_data.get('consultation_notes', existing_consultation.consultation_notes)
            existing_consultation.disease_stage = validated_data.get('disease_stage', existing_consultation.disease_stage)
            existing_consultation.save()
            consultation = existing_consultation
            
            # Delete old prescriptions/follow-ups to replace them
            consultation.prescriptions.all().delete()
            if hasattr(consultation, 'follow_up'):
                consultation.follow_up.delete()
        else:
            # Create a brand new consultation
            validated_data['patient'] = appointment.patient
            validated_data['doctor'] = appointment.doctor
            consultation = Consultation.objects.create(**validated_data)

        # Create prescriptions
        for p_data in prescriptions_data:
            ConsultationPrescription.objects.create(consultation=consultation, **p_data)

        # Create follow-up if provided
        if follow_up_data:
            ConsultationFollowUp.objects.create(consultation=consultation, **follow_up_data)

        # Mark appointment as Completed and update PatientQueue
        appointment.status = 'Completed'
        appointment.save()

        if hasattr(appointment, 'queue_entry'):
            queue_entry = appointment.queue_entry
            queue_entry.current_status = 'Completed'
            import django.utils.timezone as timezone
            queue_entry.completed_time = timezone.now()
            queue_entry.save()

        return consultation
