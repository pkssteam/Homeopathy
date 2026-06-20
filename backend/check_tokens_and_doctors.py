import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.appointments.models import Appointment

print("--- Appointments on 2026-06-20 ---")
appts = Appointment.objects.filter(appointment_date='2026-06-20').order_by('appointment_time')
for a in appts:
    print(f"Appointment ID: {a.id}")
    print(f"  Time: {a.appointment_time}")
    print(f"  Patient: {a.patient.full_name} ({a.patient.id})")
    print(f"  Doctor: {a.doctor.full_name} ({a.doctor.id})")
    print(f"  Token: {a.token_number}")
    print(f"  Status: {a.status}")
