import uuid
from django.db import models
from apps.hospitals.models import Hospital

class InventoryItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='inventory_items', null=True, blank=True)
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    stock = models.IntegerField(default=0)
    unit = models.CharField(max_length=50, default='vials')
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=50, default='In Stock')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.stock == 0:
            self.status = 'Out of Stock'
        elif self.stock <= 10:
            self.status = 'Low Stock'
        else:
            self.status = 'In Stock'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.stock} {self.unit}) at {self.hospital.hospital_name if self.hospital else 'Global'}"

    class Meta:
        ordering = ['name']
