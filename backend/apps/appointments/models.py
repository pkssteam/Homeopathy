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

    class Meta:
        db_table = 'appointments'

    def __str__(self):
        return f"Appointment {self.token_number or 'Pending'} - {self.patient.full_name} with {self.doctor.full_name}"

    def save(self, *args, **kwargs):
        # Generate token number if status is Approved and not already set
        if self.status == 'Approved' and not self.token_number:
            from django.db.models import Max
            max_token = Appointment.objects.filter(
                doctor=self.doctor,
                appointment_date=self.appointment_date,
                token_number__isnull=False
            ).aggregate(Max('token_number'))['token_number__max'] or 0
            self.token_number = max_token + 1

        super().save(*args, **kwargs)

        # Ensure PatientQueue entry exists if Approved
        if self.status == 'Approved':
            from django.db.models import Max
            from apps.appointments.models import PatientQueue
            
            if not PatientQueue.objects.filter(appointment=self).exists():
                max_queue = PatientQueue.objects.filter(
                    appointment__doctor=self.doctor,
                    appointment__appointment_date=self.appointment_date
                ).aggregate(Max('queue_number'))['queue_number__max'] or 0
                
                PatientQueue.objects.create(
                    appointment=self,
                    queue_number=max_queue + 1,
                    current_status='Waiting'
                )

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

    class Meta:
        db_table = 'patient_queue'

    def __str__(self):
        return f"Queue {self.queue_number} - Status: {self.current_status} (Appt: {self.appointment.id})"
