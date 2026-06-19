import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.hospitals.models import Hospital

print("Hospitals in DB:")
for h in Hospital.objects.all():
    print(f"ID: {h.id} | Code: {h.hospital_code} | Name: {h.hospital_name} | Branch: {h.branch_name} | Status: {h.status}")
