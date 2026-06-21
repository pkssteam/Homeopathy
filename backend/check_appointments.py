import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.appointments.models import Appointment

print("Total appointments in DB:", Appointment.objects.count())
for appt in Appointment.objects.all().order_by('-created_at')[:10]:
    print(f"ID: {appt.id} | Date: {appt.appointment_date} | Time: {appt.appointment_time} | Status: {appt.status} | Token: {appt.token_number} | Patient: {appt.patient.full_name} | Doctor: {appt.doctor.full_name}")
