from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Consultation, ConsultationPrescription, ConsultationReport, ConsultationFollowUp
from .serializers import (
    ConsultationSerializer, ConsultationPrescriptionSerializer,
    ConsultationReportSerializer, ConsultationFollowUpSerializer
)
from apps.appointments.models import Appointment

class ConsultationViewSet(viewsets.ModelViewSet):
    queryset = Consultation.objects.all()
    serializer_class = ConsultationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Consultation.objects.all().order_by('-created_at')

        # Filter by patient_id query param
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)

        # Filter by doctor_id query param
        doctor_id = self.request.query_params.get('doctor_id')
        if doctor_id:
            queryset = queryset.filter(doctor_id=doctor_id)

        # Filter by appointment_id query param
        appointment_id = self.request.query_params.get('appointment_id')
        if appointment_id:
            queryset = queryset.filter(appointment_id=appointment_id)

        # Patients can only view their own consultations
        if user.role == 'PATIENT':
            queryset = queryset.filter(patient=user)
        # Doctors can view consultations for their patients, or general consultations in their hospital
        elif user.role == 'DOCTOR':
            if not patient_id and user.hospital:
                queryset = queryset.filter(appointment__hospital=user.hospital)

        return queryset

    @action(detail=False, methods=['delete'])
    def delete_all(self, request):
        queryset = self.get_queryset()
        count = queryset.count()
        queryset.delete()
        return Response({'message': f'Successfully deleted {count} entries.'}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def upload_report(self, request, pk=None):
        consultation = self.get_object()
        report_file = request.FILES.get('report_file')
        report_name = request.data.get('report_name', 'Lab Report')
        if not report_file:
            return Response({'error': 'Please provide report file.'}, status=status.HTTP_400_BAD_REQUEST)
        
        report = ConsultationReport.objects.create(
            consultation=consultation,
            report_name=report_name,
            report_file=report_file
        )
        return Response(ConsultationReportSerializer(report).data, status=status.HTTP_201_CREATED)


class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = ConsultationPrescription.objects.all()
    serializer_class = ConsultationPrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = ConsultationPrescription.objects.all().order_by('-created_at')

        # Patients can only see their own prescriptions
        if user.role == 'PATIENT':
            queryset = queryset.filter(consultation__patient=user)
        # Inventory reps and Doctors can see their hospital's prescriptions
        elif user.hospital:
            queryset = queryset.filter(consultation__appointment__hospital=user.hospital)

        return queryset

    def list(self, request, *args, **kwargs):
        # Override to return flat fields required by the frontend PrescriptionRequestsList.jsx
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        def serialize_item(p):
            return {
                'id': str(p.id),
                'patientName': p.consultation.patient.full_name,
                'doctorName': p.consultation.doctor.full_name,
                'medicine': p.medicine_name,
                'duration': p.duration,
                'dosage': p.dosage,
                'instructions': p.instructions,
                'status': p.status,
                'created_at': p.created_at,
            }

        if page is not None:
            data = [serialize_item(p) for p in page]
            return self.get_paginated_response(data)

        data = [serialize_item(p) for p in queryset]
        return Response(data)

    @action(detail=True, methods=['post', 'patch', 'put'])
    def update_status(self, request, pk=None):
        prescription = self.get_object()
        status_val = request.data.get('status')
        if not status_val:
            return Response({'error': 'Status is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        prescription.status = status_val
        prescription.save()
        return Response(ConsultationPrescriptionSerializer(prescription).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['delete'])
    def delete_all(self, request):
        queryset = self.get_queryset()
        count = queryset.count()
        queryset.delete()
        return Response({'message': f'Successfully deleted {count} entries.'}, status=status.HTTP_204_NO_CONTENT)
