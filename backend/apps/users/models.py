import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('DOCTOR', 'Doctor'),
        ('PATIENT', 'Patient'),
        ('INVENTORY_REP', 'Inventory Representative'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    hospital = models.ForeignKey('hospitals.Hospital', on_delete=models.SET_NULL, null=True, blank=True)
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='PATIENT')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_profile_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f"{self.full_name} ({self.role})"


class Doctor(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    hospital = models.ForeignKey(
        'hospitals.Hospital', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='doctors'
    )
    specialization = models.CharField(max_length=255, blank=True, null=True)
    qualification = models.CharField(max_length=255, blank=True, null=True)
    experience_years = models.IntegerField(blank=True, null=True)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    available_days = models.CharField(max_length=255, blank=True, null=True)
    available_time = models.CharField(max_length=500, blank=True, null=True)
    status = models.CharField(max_length=50, default='Active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'doctors'

    def __str__(self):
        return f"Dr. {self.user.full_name}"


class Patient(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    hospital = models.ForeignKey(
        'hospitals.Hospital', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='patients'
    )
    patient_code = models.CharField(max_length=50, blank=True, null=True)
    gender = models.CharField(max_length=50, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    blood_group = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    emergency_contact = models.CharField(max_length=100, blank=True, null=True)
    allergies = models.TextField(blank=True, null=True)
    medical_history = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'patients'

    def __str__(self):
        return f"Patient: {self.user.full_name} ({self.patient_code})"
