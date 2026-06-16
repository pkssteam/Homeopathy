import uuid
from django.db import models

class Hospital(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    hospital_code = models.CharField(max_length=50, unique=True)
    hospital_name = models.CharField(max_length=255)
    branch_name = models.CharField(max_length=255)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    contact_number = models.CharField(max_length=50)
    email = models.EmailField()
    status = models.CharField(max_length=50, default='Active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'hospitals'

    def __str__(self):
        return f"{self.hospital_name} ({self.branch_name})"
