import uuid
from django.db import models
from django.conf import settings
from apps.appointments.models import Appointment
from apps.inventory.models import InventoryItem

class Consultation(models.Model):
    STAGE_CHOICES = (
        ('New Patient', 'New Patient'),
        ('Initial Stage', 'Initial Stage'),
        ('Improving', 'Improving'),
        ('Stable', 'Stable'),
        ('Critical', 'Critical'),
        ('Recovered', 'Recovered'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='consultation')
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='consultations'
    )
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='consultations_given'
    )
    chief_complaint = models.TextField()
    symptoms = models.TextField(blank=True, null=True)
    diagnosis_notes = models.TextField(blank=True, null=True)
    consultation_notes = models.TextField(blank=True, null=True)
    disease_stage = models.CharField(max_length=50, choices=STAGE_CHOICES, default='New Patient')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Consultation for {self.patient.full_name} by {self.doctor.full_name} on {self.created_at.date()}"

    class Meta:
        ordering = ['-created_at']
        db_table = 'consultation'

class ConsultationPrescription(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Dispensed', 'Dispensed'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    consultation = models.ForeignKey(Consultation, on_delete=models.CASCADE, related_name='prescriptions')
    medicine_name = models.CharField(max_length=200)
    inventory_item = models.ForeignKey(
        InventoryItem,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='prescriptions'
    )
    dosage = models.CharField(max_length=100)
    duration = models.CharField(max_length=100)
    instructions = models.CharField(max_length=250, blank=True, null=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'prescription'

    def __str__(self):
        return f"{self.medicine_name} - {self.dosage} for {self.duration}"

def get_report_upload_path(instance, filename):
    import os
    from django.utils import timezone
    
    consultation = instance.consultation
    hospital_name = consultation.appointment.hospital.name if consultation.appointment and consultation.appointment.hospital else "Unknown_Hospital"
    doctor_name = consultation.doctor.full_name if consultation.doctor else "Unknown_Doctor"
    patient_name = consultation.patient.full_name if consultation.patient else "Unknown_Patient"
    date_str = (consultation.created_at or timezone.now()).strftime('%Y-%m-%d')
    
    def sanitize_path_part(part):
        return "".join([c for c in part if c.isalpha() or c.isdigit() or c in " _-"]).strip()
        
    hospital_folder = sanitize_path_part(hospital_name)
    doctor_folder = sanitize_path_part(doctor_name)
    patient_folder = sanitize_path_part(patient_name)
    
    _, ext = os.path.splitext(filename)
    report_name_clean = sanitize_path_part(instance.report_name or "Report")
    new_filename = f"{date_str}_{report_name_clean}{ext}"
    
    return os.path.join(
        'consultation_reports',
        hospital_folder,
        doctor_folder,
        patient_folder,
        new_filename
    )

class ConsultationReport(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    consultation = models.ForeignKey(Consultation, on_delete=models.CASCADE, related_name='reports')
    report_name = models.CharField(max_length=200)
    report_file = models.FileField(upload_to=get_report_upload_path)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reports'

    def __str__(self):
        return self.report_name

class ConsultationFollowUp(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    consultation = models.OneToOneField(Consultation, on_delete=models.CASCADE, related_name='follow_up')
    next_visit_date = models.DateField()
    follow_up_notes = models.TextField(blank=True, null=True)
    future_appointment = models.ForeignKey(
        Appointment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='referenced_follow_up'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'follow_ups'

    def __str__(self):
        return f"Follow-up on {self.next_visit_date}"
