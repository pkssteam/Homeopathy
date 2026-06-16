from django.db import models

class Hospital(models.Model):
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    status = models.CharField(max_length=50, default='Active')
    rooms = models.IntegerField(default=5)
    phone = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class Doctor(models.Model):
    name = models.CharField(max_length=200)
    specialty = models.CharField(max_length=200)
    status = models.CharField(max_length=50, default='Active')
    phone = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    appointments_today = models.IntegerField(default=0)

    def __str__(self):
        return self.name

class Patient(models.Model):
    name = models.CharField(max_length=200)
    age = models.IntegerField()
    gender = models.CharField(max_length=50)
    phone = models.CharField(max_length=50)
    last_visit = models.CharField(max_length=50)
    condition = models.CharField(max_length=200)

    def __str__(self):
        return self.name

class Appointment(models.Model):
    apt_id = models.CharField(max_length=50, unique=True, blank=True)
    patient_name = models.CharField(max_length=200)
    doctor_name = models.CharField(max_length=200)
    time = models.CharField(max_length=50)
    date = models.CharField(max_length=50)
    type = models.CharField(max_length=100, default='Consultation')
    status = models.CharField(max_length=50, default='Scheduled')

    def save(self, *args, **kwargs):
        if not self.apt_id:
            import random
            self.apt_id = f"APT-{random.randint(100, 999)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.patient_name} - {self.doctor_name}"

class InventoryItem(models.Model):
    item_code = models.CharField(max_length=50, unique=True, blank=True)
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    stock = models.IntegerField(default=0)
    unit = models.CharField(max_length=50, default='Vials')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50, default='In Stock')

    def save(self, *args, **kwargs):
        if not self.item_code:
            import random
            self.item_code = f"INV-{random.randint(100, 999)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Prescription(models.Model):
    pr_code = models.CharField(max_length=50, unique=True, blank=True)
    patient_name = models.CharField(max_length=200)
    doctor_name = models.CharField(max_length=200)
    date = models.CharField(max_length=50)
    medicine = models.CharField(max_length=200)
    dosage = models.CharField(max_length=200)
    duration = models.CharField(max_length=100)
    status = models.CharField(max_length=50, default='Pending Dispensation')

    def save(self, *args, **kwargs):
        if not self.pr_code:
            import random
            self.pr_code = f"PR-{random.randint(200, 999)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.patient_name} - {self.medicine}"

class Bill(models.Model):
    bill_no = models.CharField(max_length=50, unique=True, blank=True)
    patient_name = models.CharField(max_length=200)
    date = models.CharField(max_length=50)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50, default='Unpaid')
    method = models.CharField(max_length=50, default='-')

    def save(self, *args, **kwargs):
        if not self.bill_no:
            import random
            self.bill_no = f"BIL-{random.randint(500, 999)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.bill_no

class Notification(models.Model):
    title = models.CharField(max_length=200)
    message = models.TextField()
    time = models.CharField(max_length=50)
    type = models.CharField(max_length=50, default='info')

    def __str__(self):
        return self.title
