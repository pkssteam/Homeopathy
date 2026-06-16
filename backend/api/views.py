from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Hospital, Doctor, Patient, Appointment, InventoryItem, Prescription, Bill, Notification
from .serializers import (
    HospitalSerializer, DoctorSerializer, PatientSerializer, AppointmentSerializer,
    InventoryItemSerializer, PrescriptionSerializer, BillSerializer, NotificationSerializer
)

@api_view(['POST'])
def login_view(request):
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')
    
    roles_mapping = {
        'admin@homepathy.com': {'name': 'Dr. Sarah Collins', 'role': 'Admin'},
        'doctor@homepathy.com': {'name': 'Dr. Amit Patel', 'role': 'Doctor'},
        'patient@homepathy.com': {'name': 'Suresh Kumar', 'role': 'Patient'},
        'inventory@homepathy.com': {'name': 'John Doe', 'role': 'InventoryRep'}
    }
    
    if email in roles_mapping and password == 'password123':
        user_info = roles_mapping[email]
        return Response({
            'id': email,
            'name': user_info['name'],
            'email': email,
            'role': user_info['role'],
            'token': 'mock-jwt-token-xyz'
        }, status=status.HTTP_200_OK)
        
    return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

class HospitalViewSet(viewsets.ModelViewSet):
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer

class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer

class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer

class BillViewSet(viewsets.ModelViewSet):
    queryset = Bill.objects.all()
    serializer_class = BillSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
