import uuid
from django.db import models
from django.conf import settings
from apps.hospitals.models import Hospital

class Appointment(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Cancelled', 'Cancelled'),
        ('Completed', 'Completed'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='appointments')
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='patient_appointments'
    )
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='doctor_appointments'
    )
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    token_number = models.IntegerField(null=True, blank=True)
    reason = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_appointments'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Appointment {self.token_number or 'Pending'} - {self.patient.full_name} with {self.doctor.full_name}"

class PatientQueue(models.Model):
    STATUS_CHOICES = (
        ('Waiting', 'Waiting'),
        ('Called', 'Called'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='queue_entry')
    queue_number = models.IntegerField()
    current_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Waiting')
    called_time = models.DateTimeField(null=True, blank=True)
    completed_time = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Queue {self.queue_number} - Status: {self.current_status} (Appt: {self.appointment.id})"
