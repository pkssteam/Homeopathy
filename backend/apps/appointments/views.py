from django.utils import timezone
from django.db import models
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Appointment, PatientQueue
from .serializers import (
    AppointmentSerializer, AppointmentWriteSerializer, PatientQueueSerializer
)

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return AppointmentWriteSerializer
        return AppointmentSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Appointment.objects.all().order_by('-created_at')
        
        if user.role == 'DOCTOR':
            queryset = queryset.filter(doctor=user)
        elif user.role == 'PATIENT':
            queryset = queryset.filter(patient=user)
            
        # Optional Query Parameters
        date_str = self.request.query_params.get('date')
        if date_str:
            queryset = queryset.filter(appointment_date=date_str)
            
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        return queryset

    def perform_create(self, serializer):
        # Default created_by to current authenticated user
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        appointment = self.get_object()
        if appointment.status != 'Pending':
            return Response(
                {'error': 'Only pending appointments can be approved.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # 1. Generate token number (sequential for Doctor + Date combo)
        max_token = Appointment.objects.filter(
            doctor=appointment.doctor,
            appointment_date=appointment.appointment_date,
            status='Approved'
        ).aggregate(models.Max('token_number'))['token_number__max'] or 0
        
        appointment.token_number = max_token + 1
        appointment.status = 'Approved'
        appointment.save()

        # 2. Add to Patient Queue
        max_queue = PatientQueue.objects.filter(
            appointment__doctor=appointment.doctor,
            appointment__appointment_date=appointment.appointment_date
        ).aggregate(models.Max('queue_number'))['queue_number__max'] or 0

        # Create or update queue entry
        queue_entry, created = PatientQueue.objects.get_or_create(
            appointment=appointment,
            defaults={
                'queue_number': max_queue + 1,
                'current_status': 'Waiting'
            }
        )

        return Response(AppointmentSerializer(appointment).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = 'Cancelled'
        appointment.save()
        
        # If in queue, clean up or complete queue entry
        if hasattr(appointment, 'queue_entry'):
            queue_entry = appointment.queue_entry
            queue_entry.current_status = 'Completed'
            queue_entry.completed_time = timezone.now()
            queue_entry.save()
            
        return Response(AppointmentSerializer(appointment).data, status=status.HTTP_200_OK)


class PatientQueueViewSet(viewsets.ModelViewSet):
    queryset = PatientQueue.objects.all()
    serializer_class = PatientQueueSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = PatientQueue.objects.all().order_by('queue_number')
        user = self.request.user

        if user.role == 'DOCTOR':
            queryset = queryset.filter(appointment__doctor=user)
        elif user.role == 'PATIENT':
            queryset = queryset.filter(appointment__patient=user)

        # Filters
        doctor_id = self.request.query_params.get('doctor_id')
        if doctor_id:
            queryset = queryset.filter(appointment__doctor_id=doctor_id)

        date_str = self.request.query_params.get('date')
        if date_str:
            queryset = queryset.filter(appointment__appointment_date=date_str)
            
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(current_status=status_filter)

        return queryset

    @action(detail=True, methods=['post'])
    def call(self, request, pk=None):
        queue_entry = self.get_object()
        
        # Mark other Called/In Progress patients for same doctor/date as Completed
        PatientQueue.objects.filter(
            appointment__doctor=queue_entry.appointment.doctor,
            appointment__appointment_date=queue_entry.appointment.appointment_date,
            current_status__in=['Called', 'In Progress']
        ).exclude(id=queue_entry.id).update(
            current_status='Completed',
            completed_time=timezone.now()
        )
        
        queue_entry.current_status = 'Called'
        queue_entry.called_time = timezone.now()
        queue_entry.save()
        
        return Response(PatientQueueSerializer(queue_entry).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def start_consultation(self, request, pk=None):
        queue_entry = self.get_object()
        queue_entry.current_status = 'In Progress'
        queue_entry.save()
        return Response(PatientQueueSerializer(queue_entry).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        queue_entry = self.get_object()
        queue_entry.current_status = 'Completed'
        queue_entry.completed_time = timezone.now()
        queue_entry.save()

        # Update Appointment status as well
        appointment = queue_entry.appointment
        appointment.status = 'Completed'
        appointment.save()

        return Response(PatientQueueSerializer(queue_entry).data, status=status.HTTP_200_OK)
